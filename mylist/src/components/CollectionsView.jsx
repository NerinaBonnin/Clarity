import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import ItemModal from './ItemModal';
import ShareModal from './ShareModal';
import SearchAPI from './SearchAPI';

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
const SORT_OPTIONS = [
  { key: 'creacion', label: 'Reciente',     icon: 'ti-clock' },
  { key: 'az',       label: 'A–Z',          icon: 'ti-sort-ascending-letters' },
  { key: 'rating',   label: 'Calificación', icon: 'ti-star' },
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
          onMouseLeave={() => setHover(0)}>★</span>
      ))}
    </div>
  );
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const EMPTY_FORM = {
  title: '', creator: '', cat: 'Películas',
  rating: 0, desc: '', img: '', spotifyUrl: '', status: 'pendiente',
};

export default function CollectionsView({ items, setItems, onAdd, onUpdate, onRemove }) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeCat, setActiveCat]       = useState('Todas');
  const [activeStatus, setActiveStatus] = useState('todos');
  const [form, setForm]     = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [sharing, setSharing]   = useState(false);
  const [preview, setPreview]   = useState(null);
  const [search, setSearch]     = useState('');
  const [sort, setSort]         = useState('creacion');
  const [sortDir, setSortDir]   = useState('desc');
  const [minRating, setMinRating] = useState(0);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPreview(ev.target.result); update('img', ev.target.result); };
    reader.readAsDataURL(file);
  };

  const addItem = async () => {
    if (!form.title.trim()) return;
    try {
      await onAdd({ ...form, title: form.title.trim(), createdAt: Date.now() });
      setForm(EMPTY_FORM);
      setPreview(null);
    } catch (e) {
      console.error('Error al agregar:', e);
    }
  };

  const removeItem = async (id, e) => {
    e.stopPropagation();
    try {
      await onRemove(id);
    } catch (e) {
      console.error('Error al eliminar:', e);
    }
  };

  const toggleSort = (key) => {
    if (sort === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setSortDir(key === 'creacion' ? 'desc' : 'asc'); }
  };

  const processed = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];
    if (activeCat !== 'Todas') list = list.filter(x => x.cat === activeCat);
    if (activeStatus !== 'todos') list = list.filter(x => (x.status || 'pendiente') === activeStatus);
    if (minRating > 0) list = list.filter(x => x.rating >= minRating);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(x =>
        x.title.toLowerCase().includes(q) ||
        (x.creator || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sort === 'creacion') cmp = (a.createdAt || 0) - (b.createdAt || 0);
      if (sort === 'az')       cmp = a.title.localeCompare(b.title, 'es');
      if (sort === 'rating')   cmp = (a.rating || 0) - (b.rating || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [items, activeCat, activeStatus, minRating, search, sort, sortDir]);

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

        {/* Búsqueda automática con API */}
        {(form.cat === 'Películas' || form.cat === 'Series' || form.cat === 'Libros' || form.cat === 'Música' || form.cat === 'Podcasts' || form.cat === 'Juegos') && (
          <>
            <div className="api-divider">o buscá automáticamente</div>
            <div className="form-group">
              <label className="input-label">
                <i className="ti ti-api" style={{ marginRight: '4px', color: 'var(--accent)' }} />
                Buscar y autocompletar
              </label>
              <SearchAPI
                cat={form.cat}
                onSelect={item => {
                  setForm(f => ({
                    ...f,
                    title:   item.title,
                    creator: item.creator,
                    img:     item.img,
                    desc:    item.desc,
                  }));
                  setPreview(item.img);
                }}
              />
            </div>
          </>
        )}

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
            {preview
              ? <img src={preview} alt="preview" className="image-preview" />
              : <div className="image-upload-placeholder">
                  <i className="ti ti-photo-plus" />
                  <span>Seleccioná una imagen de tu dispositivo</span>
                </div>
            }
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>
            <i className="ti ti-stack-2" />
            {activeCat === 'Todas' ? 'Todo' : activeCat}
          </div>
          {processed.length > 0 && (
            <button className="btn-ghost" onClick={() => setSharing(true)}>
              <i className="ti ti-share" style={{ fontSize: '14px' }} /> Compartir
            </button>
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="search-bar">
              <i className="ti ti-search" />
              <input className="input" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título o autor..." />
              {search && (
                <button className="clear-btn" onClick={() => setSearch('')}>
                  <i className="ti ti-x" />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-4)' }}>
              {processed.length} ítem{processed.length !== 1 ? 's' : ''}
              {search && ` para "${search}"`}
            </span>
            <button className="btn-ghost"
              style={{ fontSize: '12px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
              onClick={() => setShowFilters(v => !v)}>
              <i className="ti ti-adjustments-horizontal" />
              Filtros
              {(activeStatus !== 'todos' || minRating > 0 || sort !== 'creacion') && (
                <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '0 5px', fontSize: '10px' }}>
                  •
                </span>
              )}
              <i className={`ti ${showFilters ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
            </button>
          </div>

          {showFilters && (
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '0.75rem' }}>
              <div style={{ marginBottom: '10px' }}>
                <div className="sort-label" style={{ marginBottom: '6px' }}>Estado</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['todos', ...STATUSES.map(s => s.key)].map(s => (
                    <button key={s} className={`sort-btn${activeStatus === s ? ' active' : ''}`}
                      onClick={() => setActiveStatus(s)}>
                      {s === 'todos' ? 'Todos' : STATUSES.find(x => x.key === s)?.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div className="sort-label" style={{ marginBottom: '6px' }}>Calificación mínima</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[0,1,2,3,4,5].map(n => (
                    <button key={n} className={`sort-btn${minRating === n ? ' active' : ''}`}
                      onClick={() => setMinRating(n)}>
                      {n === 0 ? 'Todas' : '★'.repeat(n)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="sort-label" style={{ marginBottom: '6px' }}>Ordenar</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {SORT_OPTIONS.map(o => (
                    <button key={o.key} className={`sort-btn${sort === o.key ? ' active' : ''}`}
                      onClick={() => toggleSort(o.key)}>
                      <i className={`ti ${o.icon}`} />
                      {o.label}
                      {sort === o.key && <i className={`ti ${sortDir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'}`} />}
                    </button>
                  ))}
                </div>
              </div>
              {(search || minRating > 0 || activeStatus !== 'todos' || sort !== 'creacion') && (
                <button className="btn-ghost"
                  style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px' }}
                  onClick={() => { setSearch(''); setMinRating(0); setActiveStatus('todos'); setSort('creacion'); setSortDir('desc'); }}>
                  <i className="ti ti-x" /> Limpiar todo
                </button>
              )}
            </div>
          )}
          </>
        )}

        {processed.length === 0 ? (
          <div className="empty-state">
            <i className={search ? 'ti ti-search-off' : 'ti ti-stack-2'} />
            <p>{search ? `Sin resultados para "${search}"` : 'Sin entradas aquí todavía'}</p>
          </div>
        ) : (
          processed.map(it => (
            <div key={it.id} className="item-row" onClick={() => setSelected(it)}>
              <div className="item-thumb">
                {it.img ? <img src={it.img} alt={it.title} /> : CAT_ICONS[it.cat] || '📌'}
              </div>
              <div className="item-info">
                <div className="item-title-text">{highlight(it.title, search)}</div>
                <div className="item-meta">
                  {it.creator ? highlight(it.creator, search) + ' · ' : ''}
                  {CAT_ICONS[it.cat]} {it.cat}
                </div>
                {it.rating > 0 && (
                  <div className="stars-row">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= it.rating ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                )}
              </div>
              <select className="input"
                style={{ width: 'auto', fontSize: '11px', padding: '4px 6px', flexShrink: 0 }}
                value={it.status || 'pendiente'}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  e.stopPropagation();
                  setItems(prev => prev.map(x => x.id === it.id ? { ...x, status: e.target.value } : x));
                }}>
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
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
        <ItemModal
          item={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(id, status) => {
            onUpdate(id, { ...items.find(x => x.id === id), status });
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