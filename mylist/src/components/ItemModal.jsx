import React from 'react';

const CAT_ICONS = {
  Películas: '🎬', Series: '📺', Libros: '📚',
  Música: '🎵', Juegos: '🎮', Podcasts: '🎙️',
};
const STATUS_LABELS = {
  'pendiente':  '📋 Pendiente',
  'en-curso':   '▶️ En curso',
  'completado': '✅ Completado',
  'abandonado': '🚫 Abandonado',
};

function Stars({ rating }) {
  return (
    <div className="modal-stars">
      <span>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>★</span>
        ))}
      </span>
      <span style={{ fontSize: '12px', color: 'var(--ink-3)', marginLeft: '6px' }}>{rating}/5</span>
    </div>
  );
}

function SpotifyEmbed({ url }) {
  const getEmbedUrl = (raw) => {
    try {
      const u = new URL(raw);
      return `https://open.spotify.com/embed${u.pathname}?utm_source=generator&theme=0`;
    } catch { return null; }
  };
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="spotify-link">
      <i className="ti ti-brand-spotify" /> Abrir en Spotify
    </a>
  );
  return (
    <div style={{ marginTop: '16px' }}>
      <div className="modal-review-label">
        <i className="ti ti-brand-spotify" style={{ color: '#1DB954', marginRight: '4px' }} />
        Spotify
      </div>
      <iframe src={embedUrl} width="100%" height="152" frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy" style={{ borderRadius: '12px', marginTop: '8px' }} title="Spotify player" />
    </div>
  );
}

export default function ItemModal({ item, onClose, onStatusChange }) {
  if (!item) return null;
  const status = item.status || 'pendiente';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          <i className="ti ti-x" />
        </button>

        {item.img
          ? <img src={item.img} alt={item.title} className="modal-img" />
          : <div className="modal-img-placeholder">{CAT_ICONS[item.cat] || '📌'}</div>
        }

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div className="modal-badge">{CAT_ICONS[item.cat]} {item.cat}</div>
            <div className={`status-badge badge-${status}`}>{STATUS_LABELS[status]}</div>
          </div>

          <div className="modal-title">{item.title}</div>
          {item.creator && <div className="modal-creator">{item.creator}</div>}

          {item.rating > 0
            ? <Stars rating={item.rating} />
            : <div style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '16px' }}>Sin calificación</div>
          }

          {/* Cambiar estado desde el modal */}
          <div style={{ marginBottom: '16px' }}>
            <div className="modal-review-label">Estado</div>
            <div className="status-selector">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button key={key}
                  className={`status-btn${status === key ? ` active-${key}` : ''}`}
                  onClick={() => onStatusChange(item.id, key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {item.desc ? (
            <>
              <div className="modal-review-label">Tu reseña</div>
              <div className="modal-review-text">{item.desc}</div>
            </>
          ) : (
            <div className="modal-no-review">Sin reseña personal todavía.</div>
          )}

          {(item.cat === 'Música' || item.cat === 'Podcasts') && item.spotifyUrl && (
            <SpotifyEmbed url={item.spotifyUrl} />
          )}
        </div>
      </div>
    </div>
  );
}