import React, { useState } from 'react';

const CAT_ICONS = {
  Películas: '🎬', Series: '📺', Libros: '📚',
  Música: '🎵', Juegos: '🎮', Podcasts: '🎙️',
};

function buildTodoText(todos) {
  const date = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  const lines = todos.map(t => `${t.done ? '✅' : '⬜'} ${t.text}`);
  const done = todos.filter(t => t.done).length;
  return [
    `📋 *Mi lista de tareas* — ${date}`,
    '',
    ...lines,
    '',
    `_${done}/${todos.length} completadas_`,
    '',
    '— compartido desde mylist ✨',
  ].join('\n');
}

function buildCollectionText(items, cat) {
  const date = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  const title = cat === 'Todas' ? 'Mi colección' : `Mis ${cat}`;
  const icon = cat !== 'Todas' ? (CAT_ICONS[cat] || '📚') : '🗂️';
  const lines = items.map(it => {
    const stars = it.rating > 0 ? ' ' + '⭐'.repeat(it.rating) : '';
    const creator = it.creator ? ` — ${it.creator}` : '';
    const desc = it.desc ? `\n   _"${it.desc}"_` : '';
    return `${CAT_ICONS[it.cat] || '•'} *${it.title}*${creator}${stars}${desc}`;
  });
  return [
    `${icon} *${title}* — ${date}`,
    '',
    ...lines,
    '',
    '— compartido desde mylist ✨',
  ].join('\n');
}

export default function ShareModal({ type, todos, items, activeCat, onClose }) {
  const [copied, setCopied] = useState(false);

  const text = type === 'todo'
    ? buildTodoText(todos)
    : buildCollectionText(
        activeCat === 'Todas' ? items : items.filter(x => x.cat === activeCat),
        activeCat
      );

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const telegramUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try { await navigator.share({ text }); } catch {}
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '420px' }}>
        <button className="modal-close" onClick={onClose}>
          <i className="ti ti-x" />
        </button>
        <div className="modal-body">
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Compartir lista
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink-3)' }}>
              {type === 'todo' ? 'Tu lista de tareas' : `Colección · ${activeCat}`}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '14px',
            fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.7',
            whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto',
            fontFamily: 'monospace', marginBottom: '1.25rem',
          }}>
            {text}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="share-btn share-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Compartir en WhatsApp
              </button>
            </a>

            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="share-btn share-tg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Compartir en Telegram
              </button>
            </a>

            {!!navigator.share && (
              <button className="share-btn share-native" onClick={handleNativeShare}>
                <i className="ti ti-share" style={{ fontSize: '18px' }} />
                Más opciones (Instagram, Notes...)
              </button>
            )}

            <button className="share-btn share-copy" onClick={handleCopy}>
              <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: '18px' }} />
              {copied ? '¡Copiado!' : 'Copiar texto'}
            </button>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--ink-4)', textAlign: 'center', marginTop: '1rem' }}>
            En celular, "Más opciones" abre el menú nativo para compartir con cualquier app.
          </p>
        </div>
      </div>
    </div>
  );
}