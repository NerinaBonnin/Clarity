import React, { useState, useEffect } from 'react';
import TodoView from './components/TodoView';
import CollectionsView from './components/CollectionsView';
import { useLocalStorage } from './useLocalStorage';

export default function App() {
  const [tab, setTab] = useState('todo');
  const [todos] = useLocalStorage('todos', []);
  const [items] = useLocalStorage('items', []);
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  // Aplica el tema al elemento raíz cada vez que cambia
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const pending = todos.filter(t => !t.done).length;

  return (
    <div className="app-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <h1 className="brand">Cla<em>rity</em></h1>
          <p className="brand-sub">tu espacio personal</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} style={{ marginTop: '6px' }}>
          <i className={`ti ${theme === 'light' ? 'ti-moon' : 'ti-sun'}`} />
          {theme === 'light' ? 'Oscuro' : 'Claro'}
        </button>
      </div>

      {/* Stats */}
      <div className="stat-pills">
        <span className="stat-pill">
          <i className="ti ti-checklist" />
          {pending} tarea{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''}
        </span>
        <span className="stat-pill">
          <i className="ti ti-stack-2" />
          {items.length} en colecciones
        </span>
      </div>

      {/* Tab nav */}
      <div className="tab-nav">
        <button
          className={`tab-btn${tab === 'todo' ? ' active' : ''}`}
          onClick={() => setTab('todo')}
        >
          <i className="ti ti-checklist" /> To-Do
        </button>
        <button
          className={`tab-btn${tab === 'colecciones' ? ' active' : ''}`}
          onClick={() => setTab('colecciones')}
        >
          <i className="ti ti-grid-dots" /> Colecciones
        </button>
      </div>

      {/* Vistas */}
      {tab === 'todo' && <TodoView />}
      {tab === 'colecciones' && <CollectionsView />}

    </div>
  );
}