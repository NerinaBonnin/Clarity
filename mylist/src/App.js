import React, { useState, useEffect } from 'react';
import TodoView from './components/TodoView';
import CollectionsView from './components/CollectionsView';
import { TodoStats, CollectionStats } from './components/StatsPanel';
import { exportTodosPDF, exportColeccionesPDF } from './components/ExportPDF';
import { useLocalStorage } from './useLocalStorage';

export default function App() {
  const [tab, setTab]       = useState('todo');
  const [theme, setTheme]   = useLocalStorage('theme', 'light');
  const [todos, setTodos]   = useLocalStorage('todos', []);
  const [items]             = useLocalStorage('items', []);
  const [statsTab, setStatsTab] = useState('tareas');
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const pending = todos.filter(t => !t.done).length;

  const handleExport = async (type) => {
    setExporting(type);
    await new Promise(r => setTimeout(r, 100));
    try {
      if (type === 'tareas')      exportTodosPDF(todos);
      if (type === 'colecciones') exportColeccionesPDF(items);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="app-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <h1 className="brand">my<em>list</em></h1>
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
        <button className={`tab-btn${tab === 'exportar' ? ' active' : ''}`}
          onClick={() => setTab('exportar')}>
          <i className="ti ti-download" /> Exportar
        </button>
      </div>

      {/* Views */}
      {tab === 'todo'        && <TodoView todos={todos} setTodos={setTodos} />}
      {tab === 'colecciones' && <CollectionsView />}

      {/* Estadísticas */}
      {tab === 'stats' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <button className={`sort-btn${statsTab === 'tareas' ? ' active' : ''}`}
              onClick={() => setStatsTab('tareas')}
              style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-checklist" /> Tareas
            </button>
            <button className={`sort-btn${statsTab === 'colecciones' ? ' active' : ''}`}
              onClick={() => setStatsTab('colecciones')}
              style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-stack-2" /> Colecciones
            </button>
          </div>
          {statsTab === 'tareas'      && <TodoStats todos={todos} />}
          {statsTab === 'colecciones' && <CollectionStats items={items} />}
        </>
      )}

      {/* Exportar */}
      {tab === 'exportar' && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: '0.5rem' }}>
            <i className="ti ti-download" /> Exportar datos
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Descargá tus datos como PDF con diseño limpio y listo para imprimir o compartir.
          </p>

          {/* Tareas */}
          <div className="export-section">
            <div className="export-section-title">
              <i className="ti ti-checklist" /> Tareas
            </div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--ink-3)' }}>
              {todos.length} tarea{todos.length !== 1 ? 's' : ''} en total
              · {todos.filter(t => t.done).length} completadas
              · {todos.filter(t => !t.done).length} pendientes
            </div>
            <button className="export-btn"
              onClick={() => handleExport('tareas')}
              disabled={todos.length === 0 || exporting === 'tareas'}
              style={{ opacity: todos.length === 0 ? 0.5 : 1 }}>
              {exporting === 'tareas' ? (
                <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
              ) : (
                <><i className="ti ti-file-type-pdf" /> Descargar tareas en PDF</>
              )}
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

          {/* Colecciones */}
          <div className="export-section">
            <div className="export-section-title">
              <i className="ti ti-stack-2" /> Colecciones
            </div>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--ink-3)' }}>
              {items.length} ítem{items.length !== 1 ? 's' : ''} en total
              · {[...new Set(items.map(x => x.cat))].length} categoría{[...new Set(items.map(x => x.cat))].length !== 1 ? 's' : ''}
            </div>
            <button className="export-btn"
              onClick={() => handleExport('colecciones')}
              disabled={items.length === 0 || exporting === 'colecciones'}
              style={{ opacity: items.length === 0 ? 0.5 : 1 }}>
              {exporting === 'colecciones' ? (
                <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
              ) : (
                <><i className="ti ti-file-type-pdf" /> Descargar colecciones en PDF</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}