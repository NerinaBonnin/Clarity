import React, { useState } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import ItemModal from './ItemModal';
import ShareModal from './ShareModal';

const CATS = ['Todas', 'Películas', 'Series', 'Libros', 'Música', 'Juegos', 'Podcasts'];
const CAT_ICONS = {
  Películas: '🎬', Series: '📺', Libros: '📚',
  Música: '🎵', Juegos: '🎮', Podcasts: '🎙️',
};
const STATUSES = [
  { key: 'pendiente',  label: '📋 Pendiente' },
  { key: 'en-curso',   label: '▶️ En curso' },
  { key: 'completado', label: '✅ Completado' },
  { key: 'abandonado', label: '🚫 Abandonado' },
];

function RatingPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rating-picker">
      {[1,2,3,4,5].map(n => (
        <span key={n}
          className={`rating-star${n <= (hover || value) ? ' lit' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  title: '', creator: '', cat: 'Películas',
  rating: 0, desc: '', img: '',
  spotifyUrl: '', status: 'pendiente',
};

export default function CollectionsView() {
  const [items, setItems] = useLocalStorage('items', []);
  const [nextId, setNextId] = useLocalStorage('itemNextId', 1);
  const [activeCat, setActiveCat] = useState('Todas');
  const [activeStatus, setActiveStatus] = useState('todos');
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [preview, setPreview] = useState(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      update('img', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems(prev => [...prev, { ...form, title: form.title.trim(), id: nextId }]);
    setNextId(n => n + 1);
    setForm(EMPTY_FORM);
    setPreview(null);
  };

  const removeItem = (id, e) => {
    e.stopPropagation();
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const updateStatus = (id, status, e) => {
    e.stopPropagation();
    setItems(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  };

  const filtered = items.filter(x => {
    const catOk = activeCat === 'Todas' || x.cat === activeCat;
    const statusOk = activeStatus === 'todos' || x.status === activeStatus;
    return catOk && statusOk;
  });

  return (
    <>
      {/* Category tabs */}
      <div className="cat-tabs">
        {CATS.map(c => (
          <button key={c} className={`cat-tab${c === activeCat ? ' active' : ''}`}
            onClick={() => setActiveCat(c)}>
            {c !== 'Todas' && CAT_ICONS[c] + ' '}{c}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['todos', ...STATUSES.map(s => s.key)].map(s => (
          <button key={s}
            className={`cat-tab${activeStatus === s ? ' active' : ''}`}
            style={{ fontSize: '12px', padding: '4px 12px' }}
            onClick={() => setActiveStatus(s)}>
            {s === 'todos' ? 'Todos' : STATUSES.find(x => x.key === s)?.label}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="section-label">
          <i className="ti ti-circle-plus" /> Agregar a colección
        </div>

        <div className="form-group">
          <label className="input-label">Título *</label>
          <input className="input" value={form.title}
            onChange={e => update('title', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Nombre del ítem..." />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Categoría</label>
            <select className="input" value={form.cat} onChange={e => update('cat', e.target.value)}>
              {CATS.filter(c => c !== 'Todas').map(c => (
                <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Autor / Director / Artista</label>
            <input className="input" value={form.creator}
              onChange={e => update('creator', e.target.value)}
              placeholder="Ej: Christopher Nolan" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '12px' }}>
          <label className="input-label">Estado</label>
          <div className="status-selector">
            {STATUSES.map(s => (
              <button key={s.key}
                className={`status-btn${form.status === s.key ? ` active-${s.key}` : ''}`}
                onClick={() => update('status', s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Imagen</label>
          <label className="image-upload-area">
            {preview ? (
              <img src={preview} alt="preview" className="image-preview" />
            ) : (
              <div className="image-upload-placeholder">
                <i className="ti ti-photo-plus" />
                <span>Seleccioná una imagen de tu dispositivo</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{ display: 'none' }} />
          </label>
          {preview && (
            <button className="btn-ghost" style={{ marginTop: '6px', fontSize: '12px' }}
              onClick={() => { setPreview(null); update('img', ''); }}>
              <i className="ti ti-x" /> Quitar imagen
            </button>
          )}
        </div>

        {(form.cat === 'Música' || form.cat === 'Podcasts') && (
          <div className="form-group">
            <label className="input-label">
              <i className="ti ti-brand-spotify" style={{ color: '#1DB954', marginRight: '4px' }} />
              Link de Spotify
            </label>
            <input className="input" value={form.spotifyUrl}
              onChange={e => update('spotifyUrl', e.target.value)}
              placeholder="https://open.spotify.com/..." />
          </div>
        )}

        <div className="form-group">
          <label className="input-label">Tu calificación</label>
          <RatingPicker value={form.rating} onChange={v => update('rating', v)} />
        </div>

        <div className="form-group">
          <label className="input-label">Tu reseña personal</label>
          <textarea className="input" value={form.desc}
            onChange={e => update('desc', e.target.value)}
            placeholder="¿Qué te pareció? ¿Lo recomendarías?" />
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
          onClick={addItem}>
          <i className="ti ti-circle-plus" /> Agregar
        </button>
      </div>

      {/* Items list */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>
            <i className="ti ti-stack-2" />
            {activeCat === 'Todas' ? 'Todo' : activeCat}
            <span style={{ fontSize: '13px', fontFamily: 'Jost', fontWeight: 400, color: 'var(--ink-3)' }}>
              {' '}· {filtered.length} ítem{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filtered.length > 0 && (
            <button className="btn-ghost" onClick={() => setSharing(true)}>
              <i className="ti ti-share" style={{ fontSize: '14px' }} /> Compartir
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-stack-2" />
            <p>Sin entradas aquí todavía</p>
          </div>
        ) : (
          filtered.map(it => (
            <div key={it.id} className="item-row" onClick={() => setSelected(it)}>
              <div className="item-thumb">
                {it.img
                  ? <img src={it.img} alt={it.title} />
                  : CAT_ICONS[it.cat] || '📌'}
              </div>
              <div className="item-info">
                <div className="item-title-text">{it.title}</div>
                <div className="item-meta">
                  {it.creator ? it.creator + ' · ' : ''}{CAT_ICONS[it.cat]} {it.cat}
                </div>
                {it.rating > 0 && (
                  <div className="stars-row">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= it.rating ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Status quick-change */}
              <select
                className="input"
                style={{ width: 'auto', fontSize: '11px', padding: '4px 6px', flexShrink: 0 }}
                value={it.status || 'pendiente'}
                onClick={e => e.stopPropagation()}
                onChange={e => updateStatus(it.id, e.target.value, e)}>
                {STATUSES.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <button className="btn-del" onClick={e => removeItem(it.id, e)}
                style={{ color: 'var(--ink-4)' }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          ))
        )}
      </div>

      {selected && (
        <ItemModal item={selected} onClose={() => setSelected(null)}
          onStatusChange={(id, status) => {
            setItems(prev => prev.map(x => x.id === id ? { ...x, status } : x));
            setSelected(s => ({ ...s, status }));
          }} />
      )}
      {sharing && (
        <ShareModal type="collection" todos={[]} items={items} activeCat={activeCat}
          onClose={() => setSharing(false)} />
      )}
    </>
  );
}