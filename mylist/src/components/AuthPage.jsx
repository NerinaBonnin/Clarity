import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name) { setError('El nombre es requerido'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand">my<em>list</em></h1>
          <p className="brand-sub">tu espacio personal</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '1.5px solid var(--border)', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1, background: 'none', border: 'none',
                padding: '10px', cursor: 'pointer',
                fontFamily: 'Jost, sans-serif', fontSize: '14px',
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
                flex: 1, background: 'none', border: 'none',
                padding: '10px', cursor: 'pointer',
                fontFamily: 'Jost, sans-serif', fontSize: '14px',
                color: mode === 'register' ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: mode === 'register' ? 500 : 400,
                borderBottom: mode === 'register' ? '2px solid var(--ink)' : 'none',
                marginBottom: '-1.5px',
              }}>
              Registrarse
            </button>
          </div>

          {/* Form */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="input-label">Nombre</label>
              <input className="input" value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Tu nombre" />
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={form.email}
              onChange={e => update('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="tu@email.com" />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Contraseña</label>
            <input className="input" type="password" value={form.password}
              onChange={e => update('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••" />
          </div>

          {error && (
            <div style={{
              background: '#FEE2E2', border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontSize: '13px', color: '#991B1B', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <button className="btn-primary"
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