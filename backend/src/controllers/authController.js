const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const pool = require('../config/db');
require('dotenv').config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function authResponse(user) {
  return {
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url || null },
  };
}

async function findOrCreateOAuthUser({ email, name, provider, providerId, avatar }) {
  const [byProvider] = await pool.query(
    'SELECT id, name, email, avatar_url FROM users WHERE auth_provider = ? AND provider_id = ?',
    [provider, providerId]
  );
  if (byProvider.length > 0) return byProvider[0];

  const [byEmail] = await pool.query(
    'SELECT id, name, email, avatar_url, auth_provider FROM users WHERE email = ?',
    [email]
  );

  if (byEmail.length > 0) {
    const existing = byEmail[0];
    if (existing.auth_provider === 'local') {
      await pool.query(
        'UPDATE users SET auth_provider = ?, provider_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
        [provider, providerId, avatar || null, existing.id]
      );
    }
    return { ...existing, avatar_url: existing.avatar_url || avatar || null };
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, auth_provider, provider_id, avatar_url) VALUES (?, ?, NULL, ?, ?, ?)',
    [name, email, provider, providerId, avatar || null]
  );

  return { id: result.insertId, name, email, avatar_url: avatar || null };
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Todos los campos son requeridos' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, auth_provider) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'local']
    );

    res.status(201).json(authResponse({ id: result.insertId, name, email }));
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña requeridos' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(400).json({ message: 'Email o contraseña incorrectos' });

    const user = users[0];
    if (!user.password)
      return res.status(400).json({ message: 'Esta cuenta usa Google o Apple. Iniciá sesión con ese método.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: 'Email o contraseña incorrectos' });

    res.json(authResponse(user));
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.google = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: 'Token de Google requerido' });

    if (!process.env.GOOGLE_CLIENT_ID)
      return res.status(500).json({ message: 'Google Sign In no está configurado en el servidor' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email)
      return res.status(400).json({ message: 'No se pudo obtener el email de Google' });

    const user = await findOrCreateOAuthUser({
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      provider: 'google',
      providerId: payload.sub,
      avatar: payload.picture,
    });

    res.json(authResponse(user));
  } catch (e) {
    res.status(401).json({ message: 'Token de Google inválido' });
  }
};

exports.apple = async (req, res) => {
  try {
    const { identityToken, user: appleUser } = req.body;
    if (!identityToken)
      return res.status(400).json({ message: 'Token de Apple requerido' });

    if (!process.env.APPLE_CLIENT_ID)
      return res.status(500).json({ message: 'Apple Sign In no está configurado en el servidor' });

    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
    });

    const email = payload.email || appleUser?.email;
    if (!email)
      return res.status(400).json({ message: 'No se pudo obtener el email de Apple' });

    const name = appleUser?.name
      ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
      : email.split('@')[0];

    const user = await findOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      provider: 'apple',
      providerId: payload.sub,
    });

    res.json(authResponse(user));
  } catch (e) {
    res.status(401).json({ message: 'Token de Apple inválido' });
  }
};

exports.me = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, avatar_url FROM users WHERE id = ?',
      [req.userId]
    );
    if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(users[0]);
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};
