import React, { useState } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import ShareModal from './ShareModal';

export default function TodoView() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useLocalStorage('todoNextId', 1);
  const [sharing, setSharing] = useState(false);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    setTodos(prev => [...prev, { id: nextId, text: v, done: false }]);
    setNextId(n => n + 1);
    setInput('');
  };

  const toggle = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(prev => prev.filter(t => t.id !== id));

  const done = todos.filter(t => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="section-label">
          <i className="ti ti-pencil-plus" />
          Nueva tarea
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="input" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="¿Qué tenés que hacer?" />
          <button className="btn-primary" onClick={add}>
            <i className="ti ti-plus" />
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>
            <i className="ti ti-checklist" /> Tareas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {todos.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                {done}/{todos.length} completadas
              </span>
            )}
            {todos.length > 0 && (
              <button className="btn-ghost" onClick={() => setSharing(true)}>
                <i className="ti ti-share" style={{ fontSize: '14px' }} /> Compartir
              </button>
            )}
          </div>
        </div>

        {todos.length > 0 && (
          <div className="progress-wrap">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}

        {todos.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-mood-smile" />
            <p>Todo limpio por ahora</p>
          </div>
        ) : (
          todos.map(t => (
            <div className="todo-item" key={t.id}>
              <div className={`check-circle${t.done ? ' done' : ''}`} onClick={() => toggle(t.id)}>
                {t.done && <i className="ti ti-check" />}
              </div>
              <span className={`todo-text${t.done ? ' done' : ''}`}>{t.text}</span>
              <button className="btn-del" onClick={() => remove(t.id)}>
                <i className="ti ti-x" />
              </button>
            </div>
          ))
        )}
      </div>

      {sharing && (
        <ShareModal type="todo" todos={todos} items={[]} activeCat="Todas"
          onClose={() => setSharing(false)} />
      )}
    </>
  );
}