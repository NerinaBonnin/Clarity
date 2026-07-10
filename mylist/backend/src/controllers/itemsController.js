const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM collection_items WHERE user_id = ? ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(rows.map(r => ({
      id:         r.id,
      title:      r.title,
      creator:    r.creator,
      cat:        r.cat,
      rating:     r.rating,
      desc:       r.description,
      img:        r.img,
      spotifyUrl: r.spotify_url,
      status:     r.status,
      createdAt:  r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, creator, cat, rating, desc, img, spotifyUrl, status } = req.body;
    if (!title) return res.status(400).json({ message: 'El título es requerido' });

    const [result] = await pool.query(
      `INSERT INTO collection_items
       (user_id, title, creator, cat, rating, description, img, spotify_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, creator || '', cat, rating || 0, desc || '', img || '', spotifyUrl || '', status || 'pendiente']
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, creator, cat, rating, desc, img, spotifyUrl, status } = req.body;
    await pool.query(
      `UPDATE collection_items SET
       title = ?, creator = ?, cat = ?, rating = ?,
       description = ?, img = ?, spotify_url = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [title, creator || '', cat, rating || 0, desc || '', img || '', spotifyUrl || '', status || 'pendiente', req.params.id, req.userId]
    );
    res.json({ message: 'Actualizado' });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM collection_items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};