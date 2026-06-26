import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const TMDB_KEY = '60373b02ed1c200eca17cd29e440fd19';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p/w500';
console.log('KEY:', TMDB_KEY);

async function searchMovies(query) {
  const { data } = await axios.get(`${TMDB_BASE}/search/movie`, {
    params: { api_key: TMDB_KEY, query, language: 'es-ES', page: 1 },
  });
  return data.results.slice(0, 6).map(m => ({
    id:       m.id,
    title:    m.title,
    creator:  m.release_date ? m.release_date.slice(0, 4) : '',
    img:      m.poster_path ? IMG_BASE + m.poster_path : '',
    desc:     m.overview || '',
    rating:   0,
    cat:      'Películas',
    apiData:  { voteAverage: m.vote_average, popularity: m.popularity },
  }));
}

async function searchSeries(query) {
  const { data } = await axios.get(`${TMDB_BASE}/search/tv`, {
    params: { api_key: TMDB_KEY, query, language: 'es-ES', page: 1 },
  });
  return data.results.slice(0, 6).map(s => ({
    id:      s.id,
    title:   s.name,
    creator: s.first_air_date ? s.first_air_date.slice(0, 4) : '',
    img:     s.poster_path ? IMG_BASE + s.poster_path : '',
    desc:    s.overview || '',
    rating:  0,
    cat:     'Series',
    apiData: { voteAverage: s.vote_average, popularity: s.popularity },
  }));
}

async function searchBooks(query) {
  const { data } = await axios.get('https://www.googleapis.com/books/v1/volumes', {
    params: { q: query, maxResults: 6, langRestrict: 'es' },
  });
  if (!data.items) return [];
  return data.items.map(b => {
    const info = b.volumeInfo;
    return {
      id:      b.id,
      title:   info.title,
      creator: info.authors ? info.authors[0] : '',
      img:     info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      desc:    info.description
        ? (info.description.length > 300
            ? info.description.slice(0, 300) + '…'
            : info.description)
        : '',
      rating:  0,
      cat:     'Libros',
      apiData: { publisher: info.publisher, pageCount: info.pageCount },
    };
  });
}

export function useSearch() {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const debounceRef             = useRef(null);

  const search = useCallback(async (query, cat) => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (cat === 'Películas') data = await searchMovies(query);
        if (cat === 'Series')    data = await searchSeries(query);
        if (cat === 'Libros')    data = await searchBooks(query);
        setResults(data);
      } catch (e) {
        setError('No se pudo conectar con la API. Revisá tu conexión.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const clear = () => setResults([]);

  return { results, loading, error, search, clear };
}