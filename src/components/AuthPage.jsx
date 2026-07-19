import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { useAuth } from '../context/AuthContext';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const appleClientId = process.env.REACT_APP_APPLE_CLIENT_ID;

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  margin: '1.25rem 0',
  color: 'var(--ink-3)',
  fontSize: '12px',
};

const socialBtnStyle = {
  width: '100%',
  justifyContent: 'center',
  marginBottom: '0.5rem',
};

export default function AuthPage() {
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleError = (e) => {
    setError(e.response?.data?.message || 'Error al conectar con el servidor');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name) {
          setError('El nombre es requerido');
          setLoading(false);
          return;
        }
        await register(form.name, form.email, form.password);
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSuccess = async (response) => {
    setError('');
    setLoading(true);
    try {
      await loginWithApple(response.authorization.id_token, response.user);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand">Cla<em>rity</em></h1>
          <p className="brand-sub">tu espacio personal</p>
        </div>

        <div className="card">
          <div style={{
            display: 'flex',
            gap: '0',
            borderBottom: '1.5px solid var(--border)',
            marginBottom: '1.5rem',
          }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                fontFamily: 'Jost, sans-serif',
                fontSize: '14px',
                color: mode === 'login' ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: mode === 'login' ? 500 : 400,
                borderBottom: mode === 'login' ? '2px solid var(--ink)' : 'none',
                marginBottom: '-1.5px',
              }}>
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                fontFamily: 'Jost, sans-serif',
                fontSize: '14px',
                color: mode === 'register' ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: mode === 'register' ? 500 : 400,
                borderBottom: mode === 'register' ? '2px solid var(--ink)' : 'none',
                marginBottom: '-1.5px',
              }}>
              Registrarse
            </button>
          </div>

          {(googleClientId || appleClientId) && (
            <>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {googleClientId && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('No se pudo iniciar sesión con Google')}
                      theme="outline"
                      size="large"
                      text={mode === 'login' ? 'signin_with' : 'signup_with'}
                      locale="es"
                      width="100%"
                    />
                  </div>
                )}

                {appleClientId && (
                  <AppleSignin
                    authOptions={{
                      clientId: appleClientId,
                      scope: 'email name',
                      redirectURI: window.location.origin,
                      usePopup: true,
                    }}
                    uiType="dark"
                    onSuccess={handleAppleSuccess}
                    onError={() => setError('No se pudo iniciar sesión con Apple')}
                    render={(props) => (
                      <button
                        {...props}
                        className="btn-ghost"
                        style={{
                          ...socialBtnStyle,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#000',
                          color: '#fff',
                          border: 'none',
                        }}
                        disabled={loading || props.disabled}>
                        <i className="ti ti-brand-apple" />
                        Continuar con Apple
                      </button>
                    )}
                  />
                )}
              </div>

              <div style={dividerStyle}>
                <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                o con email
                <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
            </>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label className="input-label">Nombre</label>
              <input
                className="input"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '13px',
              color: '#991B1B',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSubmit}
            disabled={loading}>
            {loading
              ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Cargando...</>
              : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
