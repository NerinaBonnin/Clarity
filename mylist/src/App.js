import React, { useState, useEffect } from 'react';
import TodoView from './components/TodoView';
import CollectionsView from './components/CollectionsView';
import { TodoStats, CollectionStats } from './components/StatsPanel';
import { useLocalStorage } from './useLocalStorage';

export default function App() {
  const [tab, setTab]       = useState('todo');
  const [theme, setTheme]   = useLocalStorage('theme', 'light');
  const [todos, setTodos]   = useLocalStorage('todos', []);
  const [items]             = useLocalStorage('items', []);
  const [statsTab, setStatsTab] = useState('tareas');

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

      {/* Stats pills */}
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
        <button className={`tab-btn${tab === 'todo' ? ' active' : ''}`}
          onClick={() => setTab('todo')}>
          <i className="ti ti-checklist" /> To-Do
        </button>
        <button className={`tab-btn${tab === 'colecciones' ? ' active' : ''}`}
          onClick={() => setTab('colecciones')}>
          <i className="ti ti-grid-dots" /> Colecciones
        </button>
        <button className={`tab-btn${tab === 'stats' ? ' active' : ''}`}
          onClick={() => setTab('stats')}>
          <i className="ti ti-chart-bar" /> Estadísticas
        </button>
      </div>

      {/* Views */}
      {tab === 'todo'        && <TodoView todos={todos} setTodos={setTodos} />}
      {tab === 'colecciones' && <CollectionsView />}

      {tab === 'stats' && (
        <>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <button
              className={`sort-btn${statsTab === 'tareas' ? ' active' : ''}`}
              onClick={() => setStatsTab('tareas')}
              style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-checklist" /> Tareas
            </button>
            <button
              className={`sort-btn${statsTab === 'colecciones' ? ' active' : ''}`}
              onClick={() => setStatsTab('colecciones')}
              style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-stack-2" /> Colecciones
            </button>
          </div>

          {statsTab === 'tareas'      && <TodoStats todos={todos} />}
          {statsTab === 'colecciones' && <CollectionStats items={items} />}
        </>
      )}
    </div>
  );
}