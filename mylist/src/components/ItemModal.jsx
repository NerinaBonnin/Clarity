import React from 'react';

const CAT_ICONS = {
  Películas: '🎬', Series: '📺', Libros: '📚',
  Música: '🎵', Juegos: '🎮', Podcasts: '🎙️',
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
  // Convierte cualquier link de Spotify en embed
  const getEmbedUrl = (raw) => {
    try {
      const u = new URL(raw);
      // open.spotify.com/track/ID o /album/ID o /playlist/ID o /episode/ID
      const path = u.pathname; // ej: /track/4uLU6hMCjMI75M1A2tKUQC
      return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
    } catch {
      return null;
    }
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
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: '12px', marginTop: '8px' }}
        title="Spotify player"
      />
    </div>
  );
}

export default function ItemModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          <i className="ti ti-x" />
        </button>

        {item.img ? (
          <img src={item.img} alt={item.title} className="modal-img" />
        ) : (
          <div className="modal-img-placeholder">{CAT_ICONS[item.cat] || '📌'}</div>
        )}

        <div className="modal-body">
          <div className="modal-badge">{CAT_ICONS[item.cat]} {item.cat}</div>
          <div className="modal-title">{item.title}</div>
          {item.creator && <div className="modal-creator">{item.creator}</div>}

          {item.rating > 0
            ? <Stars rating={item.rating} />
            : <div style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '16px' }}>
                Sin calificación
              </div>
          }

          {item.desc ? (
            <>
              <div className="modal-review-label">Tu reseña</div>
              <div className="modal-review-text">{item.desc}</div>
            </>
          ) : (
            <div className="modal-no-review">Sin reseña personal todavía.</div>
          )}

          {/* Player de Spotify para Música y Podcasts */}
          {(item.cat === 'Música' || item.cat === 'Podcasts') && item.spotifyUrl && (
            <SpotifyEmbed url={item.spotifyUrl} />
          )}
        </div>
      </div>
    </div>
  );
}