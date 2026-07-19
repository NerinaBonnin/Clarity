import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../useLocalStorage';
import ShareModal from './ShareModal';

const PRIORITIES = [
  { key: 'alta',  label: '🔴 Alta' },
  { key: 'media', label: '🟡 Media' },
  { key: 'baja',  label: '🟢 Baja' },
];
const SORT_OPTIONS = [
  { key: 'creacion',    label: 'Creación',    icon: 'ti-clock' },
  { key: 'prioridad',   label: 'Prioridad',   icon: 'ti-alert-triangle' },
  { key: 'vencimiento', label: 'Vencimiento', icon: 'ti-calendar' },
  { key: 'az',          label: 'A–Z',         icon: 'ti-sort-ascending-letters' },
];
const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2, '': 3 };

function PriorityDot({ priority }) {
  return <span className={`priority-dot ${priority ? `dot-${priority}` : 'dot-none'}`} />;
}

function dueMeta(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(dateStr + 'T00:00:00');
  const diff  = Math.round((due - today) / 86400000);
  if (diff < 0)   return { label: `Venció hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? 's' : ''}`, cls: 'due-over' };
  if (diff === 0) return { label: 'Vence hoy', cls: 'due-soon' };
  if (diff <= 2)  return { label: `Vence en ${diff} día${diff !== 1 ? 's' : ''}`, cls: 'due-soon' };
  const d = new Date(dateStr + 'T00:00:00');
  return { label: `Vence el ${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`, cls: '' };
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const EMPTY_FORM = { text: '', priority: '', dueDate: '' };

export default function TodoView({ todos, setTodos, onAdd, onUpdate, onRemove }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [sharing, setSharing] = useState(false);
  const [filter, setFilter]   = useState('todas');
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('creacion');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const add = async () => {
    if (!form.text.trim()) return;
    await onAdd({
      text:      form.text.trim(),
      priority:  form.priority,
      dueDate:   form.dueDate,
      done:      false,
      createdAt: Date.now(),
    });
    setForm(EMPTY_FORM);
  };

  const toggle = (id) => {
    const todo = todos.find(t => t.id === id);
    onUpdate(id, { ...todo, done: !todo.done });
  };

  const remove = (id) => onRemove(id);

  const toggleSort = (key) => {
    if (sort === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setSortDir('asc'); }
  };

  const processed = useMemo(() => {
    let l = [...todos];
    if (filter === 'pendientes')  l = l.filter(t => !t.done);
    if (filter === 'completadas') l = l.filter(t => t.done);
    if (search.trim()) {
      const q = search.toLowerCase();
      l = l.filter(t => t.text.toLowerCase().includes(q));
    }
    l.sort((a, b) => {
      let cmp = 0;
      if (sort === 'creacion')    cmp = (a.createdAt || 0) - (b.createdAt || 0);
      if (sort === 'prioridad')   cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'az')          cmp = a.text.localeCompare(b.text, 'es');
      if (sort === 'vencimiento') {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = da - db;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return l;
  }, [todos, filter, search, sort, sortDir]);

  const done = todos.filter(t => t.done).length;
  const pct  = todos.length ? Math.round((done / todos.length) * 100) : 0;

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-label" style={{ marginBottom: 0 }}>
            <i className="ti ti-checklist" /> Tareas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {todos.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{done}/{todos.length}</span>
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
            <div className="progress-wrap" style={{ marginTop: 0 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="search-bar">
              <i className="ti ti-search" />
              <input className="input" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tarea..." />
              {search && (
                <button className="clear-btn" onClick={() => setSearch('')}>
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--ink-4)' }}>
              {processed.length} tarea{processed.length !== 1 ? 's' : ''}
              {search && ` para "${search}"`}
            </span>
            <button className="btn-ghost"
              style={{ fontSize: '12px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
              onClick={() => setShowFilters(v => !v)}>
              <i className="ti ti-adjustments-horizontal" />
              Filtros
              {(filter !== 'todas' || sort !== 'creacion') && (
                <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '0 5px', fontSize: '10px' }}>
                  •
                </span>
              )}
              <i className={`ti ${showFilters ? 'ti-chevron-up' : 'ti-chevron-down'}`} />
            </button>
          </div>

          {showFilters && (
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '0.75rem' }}>
              <div style={{ marginBottom: '10px' }}>
                <div className="sort-label" style={{ marginBottom: '6px' }}>Estado</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['todas', 'pendientes', 'completadas'].map(f => (
                    <button key={f} className={`sort-btn${filter === f ? ' active' : ''}`}
                      onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="sort-label" style={{ marginBottom: '6px' }}>Ordenar</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {SORT_OPTIONS.map(o => (
                    <button key={o.key} className={`sort-btn${sort === o.key ? ' active' : ''}`}
                      onClick={() => toggleSort(o.key)}>
                      <i className={`ti ${o.icon}`} />
                      {o.label}
                      {sort === o.key && <i className={`ti ${sortDir === 'asc' ? 'ti-arrow-up' : 'ti-arrow-down'}`} />}
                    </button>
                  ))}
                </div>
              </div>
              {(filter !== 'todas' || sort !== 'creacion' || search) && (
                <button className="btn-ghost"
                  style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px' }}
                  onClick={() => { setFilter('todas'); setSort('creacion'); setSortDir('asc'); setSearch(''); }}>
                  <i className="ti ti-x" /> Limpiar todo
                </button>
              )}
            </div>
          )}
          </>
        )}

        {processed.length === 0 ? (
          <div className="empty-state">
            <i className={search ? 'ti ti-search-off' : 'ti ti-mood-smile'} />
            <p>{search ? `Sin resultados para "${search}"` : todos.length === 0 ? 'Sin tareas todavía' : 'Sin tareas aquí'}</p>
          </div>
        ) : (
          processed.map(t => {
            const meta = dueMeta(t.dueDate);
            return (
              <div className="todo-item" key={t.id}>
                <PriorityDot priority={t.priority} />
                <div className={`check-circle${t.done ? ' done' : ''}`} onClick={() => toggle(t.id)}>
                  {t.done && <i className="ti ti-check" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className={`todo-text${t.done ? ' done' : ''}`}>
                    {highlight(t.text, search)}
                  </span>
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