import React from 'react';

function DonutChart({ segments, size = 110, stroke = 16 }) {
  const r     = (size - stroke) / 2;
  const circ  = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);

  let offset = 0;
  const slices = segments.map(seg => {
    const pct   = total ? seg.value / total : 0;
    const dash  = pct * circ;
    const gap   = circ - dash;
    const slice = { ...seg, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg
      className="donut-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      {total === 0 ? (
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="var(--border)" strokeWidth={stroke} />
      ) : (
        slices.map((s, i) => (
          <circle key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt" />
        ))
      )}
      <text x="50%" y="50%"
        textAnchor="middle" dominantBaseline="middle"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '20px', fontWeight: 600,
          fill: 'var(--ink)',
        }}>
        {total}
      </text>
    </svg>
  );
}

function BarRow({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-val">{value}</span>
    </div>
  );
}

export function TodoStats({ todos }) {
  const total       = todos.length;
  const completadas = todos.filter(t => t.done).length;
  const pendientes  = todos.filter(t => !t.done).length;
  const alta        = todos.filter(t => !t.done && t.priority === 'alta').length;
  const media       = todos.filter(t => !t.done && t.priority === 'media').length;
  const baja        = todos.filter(t => !t.done && t.priority === 'baja').length;
  const sinP        = todos.filter(t => !t.done && !t.priority).length;

  const today = new Date(); today.setHours(0,0,0,0);
  const vencidas = todos.filter(t => {
    if (t.done || !t.dueDate) return false;
    return new Date(t.dueDate + 'T00:00:00') < today;
  }).length;

  const pct = total ? Math.round((completadas / total) * 100) : 0;

  const donut = [
    { label: 'Completadas', value: completadas, color: '#4A7C59' },
    { label: 'Pendientes',  value: pendientes,  color: '#C9922A' },
    { label: 'Vencidas',    value: vencidas,    color: '#C0544A' },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#4A7C59' }}>{completadas}</div>
          <div className="stat-card-label">Completadas</div>
          <div className="stat-card-bar" style={{ background: '#4A7C59', width: `${pct}%` }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#C9922A' }}>{pendientes}</div>
          <div className="stat-card-label">Pendientes</div>
          <div className="stat-card-bar" style={{ background: '#C9922A', width: total ? `${Math.round(pendientes/total*100)}%` : '0%' }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#C0544A' }}>{vencidas}</div>
          <div className="stat-card-label">Vencidas</div>
          <div className="stat-card-bar" style={{ background: '#C0544A', width: total ? `${Math.round(vencidas/total*100)}%` : '0%' }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{pct}%</div>
          <div className="stat-card-label">Progreso</div>
          <div className="stat-card-bar" style={{ background: 'var(--accent)', width: `${pct}%` }} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="stats-section-title">
          <i className="ti ti-chart-donut" /> Distribución
        </div>
        <div className="donut-wrap">
          <DonutChart segments={donut} size={110} stroke={16} />
          <div className="donut-legend">
            {donut.map(s => (
              <div className="legend-item" key={s.label}>
                <span className="legend-dot" style={{ background: s.color }} />
                {s.label}
                <span className="legend-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="stats-section-title">
          <i className="ti ti-alert-triangle" /> Pendientes por prioridad
        </div>
        <div className="bar-chart">
          <BarRow label="🔴 Alta"   value={alta}  max={pendientes || 1} color="#EF4444" />
          <BarRow label="🟡 Media"  value={media} max={pendientes || 1} color="#F59E0B" />
          <BarRow label="🟢 Baja"   value={baja}  max={pendientes || 1} color="#22C55E" />
          <BarRow label="Sin prio." value={sinP}  max={pendientes || 1} color="var(--border-md)" />
        </div>
      </div>
    </div>
  );
}

export function CollectionStats({ items }) {
  const total      = items.length;
  const completado = items.filter(x => x.status === 'completado').length;
  const enCurso    = items.filter(x => x.status === 'en-curso').length;
  const pendiente  = items.filter(x => !x.status || x.status === 'pendiente').length;
  const abandonado = items.filter(x => x.status === 'abandonado').length;

  const withRating = items.filter(x => x.rating > 0);
  const avgRating  = withRating.length
    ? (withRating.reduce((s, x) => s + x.rating, 0) / withRating.length).toFixed(1)
    : '—';

  const CAT_ICONS = {
    Películas: '🎬', Series: '📺', Libros: '📚',
    Música: '🎵', Juegos: '🎮', Podcasts: '🎙️',
  };
  const catCounts = Object.entries(CAT_ICONS)
    .map(([cat, icon]) => ({
      label: icon + ' ' + cat,
      value: items.filter(x => x.cat === cat).length,
    }))
    .filter(x => x.value > 0)
    .sort((a, b) => b.value - a.value);

  const donut = [
    { label: 'Completado', value: completado, color: '#4A7C59' },
    { label: 'En curso',   value: enCurso,    color: '#3B82F6' },
    { label: 'Pendiente',  value: pendiente,  color: '#C9922A' },
    { label: 'Abandonado', value: abandonado, color: '#C0544A' },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Total</div>
          <div className="stat-card-bar" style={{ background: 'var(--accent)', width: '100%' }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#4A7C59' }}>{completado}</div>
          <div className="stat-card-label">Completados</div>
          <div className="stat-card-bar" style={{ background: '#4A7C59', width: total ? `${Math.round(completado/total*100)}%` : '0%' }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#3B82F6' }}>{enCurso}</div>
          <div className="stat-card-label">En curso</div>
          <div className="stat-card-bar" style={{ background: '#3B82F6', width: total ? `${Math.round(enCurso/total*100)}%` : '0%' }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#C9922A' }}>{avgRating}</div>
          <div className="stat-card-label">Calif. promedio</div>
          <div className="stat-card-bar" style={{ background: '#C9922A', width: avgRating !== '—' ? `${(parseFloat(avgRating) / 5) * 100}%` : '0%' }} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="stats-section-title">
          <i className="ti ti-chart-donut" /> Por estado
        </div>
        <div className="donut-wrap">
          <DonutChart segments={donut} size={110} stroke={16} />
          <div className="donut-legend">
            {donut.map(s => (
              <div className="legend-item" key={s.label}>
                <span className="legend-dot" style={{ background: s.color }} />
                {s.label}
                <span className="legend-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {catCounts.length > 0 && (
        <div className="card">
          <div className="stats-section-title">
            <i className="ti ti-category" /> Por categoría
          </div>
          <div className="bar-chart">
            {catCounts.map(c => (
              <BarRow key={c.label} label={c.label} value={c.value}
                max={Math.max(...catCounts.map(x => x.value))} color="var(--accent)" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}