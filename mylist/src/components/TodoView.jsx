import React, { useState } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import ShareModal from './ShareModal';

const PRIORITIES = [
  { key: 'alta',  label: '🔴 Alta' },
  { key: 'media', label: '🟡 Media' },
  { key: 'baja',  label: '🟢 Baja' },
];

function PriorityDot({ priority }) {
  if (!priority) return <span className="priority-dot dot-none" />;
  return <span className={`priority-dot dot-${priority}`} />;
}

function formatDate(str) {
  if (!str) return null;
  const date = new Date(str + 'T00:00:00');
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function dueMeta(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0)  return { label: `Venció hace ${Math.abs(diff)} día${Math.abs(diff)!==1?'s':''}`, cls: 'due-over' };
  if (diff === 0) return { label: 'Vence hoy', cls: 'due-soon' };
  if (diff <= 2)  return { label: `Vence en ${diff} día${diff!==1?'s':''}`, cls: 'due-soon' };
  return { label: `Vence el ${formatDate(dateStr)}`, cls: '' };
}

const EMPTY_FORM = { text: '', priority: '', dueDate: '' };

export default function TodoView() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [nextId, setNextId] = useLocalStorage('todoNextId', 1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sharing, setSharing] = useState(false);
  const [filter, setFilter] = useState('todas');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const add = () => {
    if (!form.text.trim()) return;
    setTodos(prev => [...prev, {
      id: nextId,
      text: form.text.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      done: false,
    }]);
    setNextId(n => n + 1);
    setForm(EMPTY_FORM);
  };

  const toggle = (id) => setTodos(prev =>
    prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
  );
  const remove = (id) => setTodos(prev => prev.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (filter === 'pendientes') return !t.done;
    if (filter === 'completadas') return t.done;
    return true;
  });

  const done = todos.filter(t => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <>
      {/* Add Task */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="section-label">
          <i className="ti ti-pencil-plus" /> Nueva tarea
        </div>

        <div className="form-group">
          <label className="input-label">Tarea *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input" value={form.text}
              onChange={e => update('text', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="¿Qué tenés que hacer?" />
            <button className="btn-primary" onClick={add}>
              <i className="ti ti-plus" />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Prioridad</label>
          <div className="priority-selector">
            {PRIORITIES.map(p => (
              <button key={p.key}
                className={`priority-btn${form.priority === p.key ? ` active-${p.key}` : ''}`}
                onClick={() => update('priority', form.priority === p.key ? '' : p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Fecha límite (opcional)</label>
          <input className="input" type="date" value={form.dueDate}
            onChange={e => update('dueDate', e.target.value)} />
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>
            <i className="ti ti-checklist" /> Tareas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {todos.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                {done}/{todos.length}
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
          <>
            <div className="progress-wrap">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              {['todas', 'pendientes', 'completadas'].map(f => (
                <button key={f} className={`cat-tab${filter === f ? ' active' : ''}`}
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                  onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-mood-smile" />
            <p>{todos.length === 0 ? 'Todo limpio por ahora' : 'Sin tareas en esta categoría'}</p>
          </div>
        ) : (
          filtered.map(t => {
            const meta = dueMeta(t.dueDate);
            return (
              <div className="todo-item" key={t.id}>
                <PriorityDot priority={t.priority} />
                <div className={`check-circle${t.done ? ' done' : ''}`} onClick={() => toggle(t.id)}>
                  {t.done && <i className="ti ti-check" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className={`todo-text${t.done ? ' done' : ''}`}>{t.text}</span>
                  {meta && !t.done && (
                    <div className={`todo-meta ${meta.cls}`}>
                      <i className="ti ti-calendar" style={{ fontSize: '11px' }} /> {meta.label}
                    </div>
                  )}
                </div>
                <button className="btn-del" onClick={() => remove(t.id)}>
                  <i className="ti ti-x" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {sharing && (
        <ShareModal type="todo" todos={todos} items={[]} activeCat="Todas"
          onClose={() => setSharing(false)} />
      )}
    </>
  );
}