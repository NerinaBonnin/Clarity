import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';

const SEARCHABLE = ['Películas', 'Series', 'Libros', 'Música', 'Podcasts', 'Juegos'];

export default function SearchAPI({ cat, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const { results, loading, error, search, clear } = useSearch();

  if (!SEARCHABLE.includes(cat)) return null;

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    search(val, cat);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery('');
    setOpen(false);
    clear();
  };

  const handleClear = () => { setQuery(''); setOpen(false); clear(); };

  const placeholder = {
    Películas: 'Buscar película...',
    Series:    'Buscar serie...',
    Libros:    'Buscar libro...',
    Música:    'Buscar canción o artista...',
    Podcasts:  'Buscar podcast...',
    Juegos:    'Buscar videojuego...',
  }[cat];

  return (
    <div className="api-search-wrap">
      <div className="search-bar" style={{ marginBottom: 0 }}>
        <i className={`ti ${loading ? 'ti-loader-2 spin-icon' : 'ti-api'}`} />
        <input className="input" value={query} onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder} autoComplete="off" />
        {query && (
          <button className="clear-btn" onClick={handleClear}>
            <i className="ti ti-x" />
          </button>
        )}
      </div>

      {!open && !query && (
        <div className="api-hint">
          <i className="ti ti-sparkles" /> Buscá y autocompletá los datos automáticamente
        </div>
      )}

      {error && (
        <div className="api-error">
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="api-results">
          {results.map(r => (
            <div key={r.id} className="api-result-item" onClick={() => handleSelect(r)}>
              <div className="api-result-img">
                {r.img
                  ? <img src={r.img} alt={r.title} />
                  : <span>{
                    cat === 'Libros'   ? '📚' :
                    cat === 'Series'   ? '📺' :
                    cat === 'Música'   ? '🎵' :
                    cat === 'Podcasts' ? '🎙️' :
                    cat === 'Juegos'   ? '🎮' : '🎬'
                    }</span>
                }
              </div>
              <div className="api-result-info">
                <div className="api-result-title">{r.title}</div>
                <div className="api-result-meta">
                  {r.creator && <span>{r.creator}</span>}
                  {r.apiData?.voteAverage > 0 && (
                    <span className="api-vote">★ {r.apiData.voteAverage.toFixed(1)}</span>
                  )}
                  {r.apiData?.year && <span>{r.apiData.year}</span>}
                </div>
                {r.desc && (
                  <div className="api-result-desc">
                    {r.desc.length > 80 ? r.desc.slice(0, 80) + '…' : r.desc}
                  </div>
                )}
              </div>
              <div className="api-result-meta">
                {r.creator && <span>{r.creator}</span>}
                {r.apiData?.voteAverage > 0 && (
                  <span className="api-vote">★ {r.apiData.voteAverage.toFixed(1)}</span>
                )}
                {r.apiData?.year && <span>{r.apiData.year}</span>}
                {r.apiData?.listeners && (
                  <span>🎧 {r.apiData.listeners} oyentes</span>
                )}
              </div>

              <div className="api-result-meta">
                {r.creator && <span>{r.creator}</span>}
                {r.apiData?.voteAverage > 0 && (
                  <span className="api-vote">★ {r.apiData.voteAverage.toFixed(1)}</span>
                )}
                {r.apiData?.year && <span>{r.apiData.year}</span>}
                {r.apiData?.listeners && (
                  <span>🎧 {r.apiData.listeners} oyentes</span>
                )}
                {r.apiData?.episodes && (
                  <span>🎙️ {r.apiData.episodes}</span>
                )}
                {r.apiData?.genre && (
                  <span>{r.apiData.genre}</span>
                )}
              </div>

              <div className="api-result-meta">
                {r.creator && <span>{r.creator}</span>}
                {r.apiData?.voteAverage > 0 && (
                  <span className="api-vote">★ {r.apiData.voteAverage.toFixed(1)}</span>
                )}
                {r.apiData?.year && <span>{r.apiData.year}</span>}
                {r.apiData?.listeners && (
                  <span>🎧 {r.apiData.listeners} oyentes</span>
                )}
                {r.apiData?.episodes && (
                  <span>🎙️ {r.apiData.episodes}</span>
                )}
                {r.apiData?.genre && (
                  <span>{r.apiData.genre}</span>
                )}
                {r.apiData?.rating && (
                  <span className="api-vote">★ {r.apiData.rating}</span>
                )}
                {r.apiData?.platforms && (
                  <span>🎮 {r.apiData.platforms}</span>
                )}
              </div>
              <button className="api-select-btn"><i className="ti ti-plus" /></button>
            </div>
          ))}
        </div>
      )}

      {open && !loading && query.length >= 3 && results.length === 0 && !error && (
        <div className="api-empty">Sin resultados para "<strong>{query}</strong>"</div>
      )}
    </div>
  );
}