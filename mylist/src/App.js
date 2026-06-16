import React, { useState } from 'react';
import TodoView from './components/TodoView';
import CollectionsView from './components/CollectionsView';
import { useLocalStorage } from './useLocalStorage';

export default function App() {
  const [tab, setTab] = useState('todo');
  const [todos] = useLocalStorage('todos', []);
  const [items] = useLocalStorage('items', []);

  const pending = todos.filter(t => !t.done).length;

  return (
    <div className="app-wrapper">

      {/* Brand */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h1 className="brand">my<em>list</em></h1>
        <p className="brand-sub">tu espacio personal</p>
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
