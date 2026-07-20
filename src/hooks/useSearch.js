import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const TMDB_KEY  = '60373b02ed1c200eca17cd29e440fd19';
//const _LASTFM_KEY  = '167cc0a0c14aacb56a85f0a4c1704b11';
const RAWG_KEY   = '403ed0bd7ab94ba59cdae5450ab39947';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p/w500';

async function searchMovies(query) {
  const { data } = await axios.get(`${TMDB_BASE}/search/movie`, {
    params: { api_key: TMDB_KEY, query, language: 'es-ES', page: 1 },
  });
  return data.results.slice(0, 6).map(m => ({
    id:      m.id,
    title:   m.title,
    creator: m.release_date ? m.release_date.slice(0, 4) : '',
    img:     m.poster_path ? IMG_BASE + m.poster_path : '',
    desc:    m.overview || '',
    rating:  0,
    cat:     'Películas',
    apiData: { voteAverage: m.vote_average },
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
    apiData: { voteAverage: s.vote_average },
  }));
}

async function searchBooks(query) {
  const { data } = await axios.get('https://openlibrary.org/search.json', {
    params: {
      q:      query,
      limit:  6,
      fields: 'key,title,author_name,cover_i,first_publish_year,subject',
    },
  });
  if (!data.docs || data.docs.length === 0) return [];
  return data.docs.slice(0, 6).map(b => ({
    id:      b.key,
    title:   b.title || 'Sin título',
    creator: b.author_name ? b.author_name[0] : '',
    img:     b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : '',
    desc:    b.subject ? 'Temas: ' + b.subject.slice(0, 5).join(', ') : '',
    rating:  0,
    cat:     'Libros',
    apiData: { year: b.first_publish_year },
  }));
}

async function searchMusic(query) {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: {
      term:       query,
      media:      'music',
      entity:     'song',
      limit:      6,
      lang:       'es_es',
      country:    'AR',
    },
  });

  if (!data?.results || data.results.length === 0) return [];

  return data.results.map(t => ({
    id:      t.trackId,
    title:   t.trackName,
    creator: t.artistName || '',
    img:     t.artworkUrl100?.replace('100x100', '300x300') || '',
    desc:    t.collectionName ? `Álbum: ${t.collectionName}` : '',
    rating:  0,
    cat:     'Música',
    apiData: {
      year: t.releaseDate ? t.releaseDate.slice(0, 4) : '',
      genre: t.primaryGenreName || '',
    },
  }));
}

async function searchPodcasts(query) {
  const { data } = await axios.get('https://itunes.apple.com/search', {
    params: {
      term:    query,
      media:   'podcast',
      entity:  'podcast',
      limit:   6,
      lang:    'es_es',
      country: 'AR',
    },
  });

  if (!data?.results || data.results.length === 0) return [];

  return data.results.map(p => ({
    id:      p.collectionId,
    title:   p.collectionName,
    creator: p.artistName || '',
    img:     p.artworkUrl100?.replace('100x100', '300x300') || '',
    desc:    p.primaryGenreName ? `Género: ${p.primaryGenreName}` : '',
    rating:  0,
    cat:     'Podcasts',
    apiData: {
      episodes: p.trackCount ? `${p.trackCount} episodios` : '',
      genre:    p.primaryGenreName || '',
    },
  }));
}

async function searchGames(query) {
  const { data } = await axios.get('https://api.rawg.io/api/games', {
    params: {
      key:      RAWG_KEY,
      search:   query,
      page_size: 6,
      language: 'es',
    },
  });

  if (!data?.results || data.results.length === 0) return [];

  return data.results.map(g => ({
    id:      g.id,
    title:   g.name,
    creator: g.developers?.[0]?.name || '',
    img:     g.background_image || '',
    desc:    g.genres?.length > 0
      ? `Géneros: ${g.genres.slice(0, 3).map(x => x.name).join(', ')}`
      : '',
    rating:  0,
    cat:     'Juegos',
    apiData: {
      year:   g.released ? g.released.slice(0, 4) : '',
      rating: g.rating ? g.rating.toFixed(1) : '',
      platforms: g.platforms?.slice(0, 2).map(p => p.platform.name).join(', ') || '',
    },
  }));
}

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const debounceRef           = useRef(null);

  const search = useCallback(async (query, cat) => {
    if (!query.trim() || query.length < 3) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        if (cat === 'Películas') data = await searchMovies(query);
        if (cat === 'Series')    data = await searchSeries(query);
        if (cat === 'Libros')    data = await searchBooks(query);
        if (cat === 'Música') data = await searchMusic(query);
        if (cat === 'Podcasts') data = await searchPodcasts(query);
        if (cat === 'Juegos') data = await searchGames(query);
        setResults(data);
      } catch (e) {
        if (e.response?.status === 429) {
          setError('Demasiadas búsquedas. Esperá un momento e intentá de nuevo.');
        } else {
          setError('No se pudo conectar con la API. Revisá tu conexión.');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const clear = () => { setResults([]); setError(null); };

  return { results, loading, error, search, clear };
}