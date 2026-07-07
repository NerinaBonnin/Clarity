import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIORITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja', '': '-' };
const STATUS_LABEL   = {
  'pendiente': 'Pendiente', 'en-curso': 'En curso',
  'completado': 'Completado', 'abandonado': 'Abandonado',
};
const CAT_ICONS_TEXT = {
  Películas: 'Películas', Series: 'Series', Libros: 'Libros',
  Música: 'Música', Juegos: 'Juegos', Podcasts: 'Podcasts',
};

function formatDate(str) {
  if (!str) return '-';
  return new Date(str + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const C = {
  ink:    [28,  25,  23],
  accent: [74,  124, 89],
  gold:   [201, 146, 42],
  muted:  [140, 133, 124],
  bg:     [245, 242, 237],
  white:  [253, 252, 250],
  danger: [192, 84,  74],
  blue:   [59,  130, 246],
  border: [221, 216, 208],
  green:  [74,  124, 89],
  yellow: [245, 158, 11],
  red:    [239, 68,  68],
  gray:   [181, 175, 168],
};

function addHeader(doc, title, subtitle) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...C.ink);
  doc.rect(0, 0, W, 36, 'F');
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  doc.text('mylist', 14, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.gray);
  doc.text(title, 14, 30);
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(dateStr, W - 14, 22, { align: 'right' });
  if (subtitle) doc.text(subtitle, W - 14, 30, { align: 'right' });
  return 46;
}

function addFooter(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(...C.border);
  doc.rect(0, H - 14, W, 14, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text('Exportado desde mylist · tu espacio personal', 14, H - 5);
  doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, W - 14, H - 5, { align: 'right' });
}

export function exportTodosPDF(todos) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();

  const total       = todos.length;
  const completadas = todos.filter(t => t.done).length;
  const pendientes  = todos.filter(t => !t.done).length;
  const vencidas    = todos.filter(t => {
    if (t.done || !t.dueDate) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    return new Date(t.dueDate + 'T00:00:00') < today;
  }).length;
  const pct = total ? Math.round((completadas / total) * 100) : 0;

  let y = addHeader(doc, 'Lista de Tareas', `${completadas}/${total} completadas`);

  const cardW = (W - 28 - 9) / 4;
  const cards = [
    { label: 'Total',       val: total,      color: C.accent },
    { label: 'Completadas', val: completadas, color: C.green  },
    { label: 'Pendientes',  val: pendientes,  color: C.gold   },
    { label: 'Progreso',    val: `${pct}%`,   color: C.blue   },
  ];
  cards.forEach((c, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...c.color);
    doc.text(String(c.val), x + cardW / 2, y + 11, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(c.label, x + cardW / 2, y + 18, { align: 'center' });
  });
  y += 30;

  doc.setFillColor(...C.border);
  doc.roundedRect(14, y, W - 28, 5, 2, 2, 'F');
  if (pct > 0) {
    doc.setFillColor(...C.accent);
    doc.roundedRect(14, y, ((W - 28) * pct) / 100, 5, 2, 2, 'F');
  }
  y += 12;

  autoTable(doc, {
    startY: y,
    head: [['Estado', 'Tarea', 'Prioridad', 'Fecha límite']],
    body: todos.map(t => [
      t.done ? '✓ Hecha' : '○ Pendiente',
      t.text,
      PRIORITY_LABEL[t.priority || ''],
      t.dueDate ? formatDate(t.dueDate) : '-',
    ]),
    styles: {
      font: 'helvetica', fontSize: 9, cellPadding: 4,
      textColor: C.ink, lineColor: C.border, lineWidth: 0.3,
    },
    headStyles: { fillColor: C.ink, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 34, halign: 'center' },
    },
    alternateRowStyles: { fillColor: C.bg },
    didParseCell(data) {
      if (data.column.index === 0 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw.startsWith('✓') ? C.green : C.gold;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.raw === 'Alta')  data.cell.styles.textColor = C.red;
        if (data.cell.raw === 'Media') data.cell.styles.textColor = C.yellow;
        if (data.cell.raw === 'Baja')  data.cell.styles.textColor = C.green;
      }
    },
    didDrawPage() { addFooter(doc); },
    margin: { left: 14, right: 14 },
  });

  if (vencidas > 0) {
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFillColor(254, 226, 226);
    doc.setDrawColor(...C.danger);
    doc.roundedRect(14, finalY, W - 28, 10, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.danger);
    doc.text(`⚠ ${vencidas} tarea${vencidas !== 1 ? 's' : ''} vencida${vencidas !== 1 ? 's' : ''}`, 20, finalY + 6.5);
  }

  addFooter(doc);
  doc.save('mylist-tareas.pdf');
}

export function exportColeccionesPDF(items) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();

  const total      = items.length;
  const completado = items.filter(x => x.status === 'completado').length;
  const enCurso    = items.filter(x => x.status === 'en-curso').length;
  const withRating = items.filter(x => x.rating > 0);
  const avgRating  = withRating.length
    ? (withRating.reduce((s, x) => s + x.rating, 0) / withRating.length).toFixed(1)
    : '-';

  let y = addHeader(doc, 'Mis Colecciones', `${total} ítems en total`);

  const cardW = (W - 28 - 9) / 4;
  const cards = [
    { label: 'Total',       val: total,      color: C.accent },
    { label: 'Completados', val: completado,  color: C.green  },
    { label: 'En curso',    val: enCurso,     color: C.blue   },
    { label: 'Calif. prom', val: avgRating !== '-' ? `★ ${avgRating}` : '-', color: C.gold },
  ];
  cards.forEach((c, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...c.color);
    doc.text(String(c.val), x + cardW / 2, y + 11, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(c.label, x + cardW / 2, y + 18, { align: 'center' });
  });
  y += 30;

  const CATS = ['Películas', 'Series', 'Libros', 'Música', 'Juegos', 'Podcasts'];
  CATS.forEach(cat => {
    const catItems = items.filter(x => x.cat === cat);
    if (catItems.length === 0) return;

    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      addFooter(doc);
      y = 16;
    }

    doc.setFillColor(...C.accent);
    doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text(cat, 19, y + 5.5);
    doc.text(`${catItems.length} ítem${catItems.length !== 1 ? 's' : ''}`, W - 14, y + 5.5, { align: 'right' });
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Título', 'Autor/Director', 'Estado', 'Calificación', 'Reseña']],
      body: catItems.map(it => [
        it.title,
        it.creator || '-',
        STATUS_LABEL[it.status || 'pendiente'],
        it.rating > 0 ? '★'.repeat(it.rating) + ' ' + it.rating + '/5' : '-',
        it.desc ? (it.desc.length > 60 ? it.desc.slice(0, 60) + '…' : it.desc) : '-',
      ]),
      styles: {
        font: 'helvetica', fontSize: 8, cellPadding: 3,
        textColor: C.ink, lineColor: C.border, lineWidth: 0.3,
      },
      headStyles: { fillColor: C.ink, textColor: C.white, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 34 },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 24, halign: 'center' },
        4: { cellWidth: 'auto', fontStyle: 'italic' },
      },
      alternateRowStyles: { fillColor: C.bg },
      didParseCell(data) {
        if (data.column.index === 2 && data.section === 'body') {
          if (data.cell.raw === 'Completado') data.cell.styles.textColor = C.green;
          if (data.cell.raw === 'En curso')   data.cell.styles.textColor = C.blue;
          if (data.cell.raw === 'Abandonado') data.cell.styles.textColor = C.danger;
        }
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.styles.textColor = C.gold;
        }
      },
      didDrawPage() { addFooter(doc); },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 8;
  });

  addFooter(doc);
  doc.save('mylist-colecciones.pdf');
}