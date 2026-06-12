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
      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{rating}/5</span>
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
          <img src={item.img} alt={item.title} className="modal-img"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="modal-img-placeholder">{CAT_ICONS[item.cat] || '📌'}</div>
        )}

        <div className="modal-body">
          <div className="modal-badge">{CAT_ICONS[item.cat]} {item.cat}</div>
          <div className="modal-title">{item.title}</div>
          {item.creator && <div className="modal-creator">{item.creator}</div>}

          {item.rating > 0
            ? <Stars rating={item.rating} />
            : <div style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '16px' }}>Sin calificación</div>
          }

          {item.desc ? (
            <>
              <div className="modal-review-label">Tu reseña</div>
              <div className="modal-review-text">{item.desc}</div>
            </>
          ) : (
            <div className="modal-no-review">Sin reseña personal todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
}