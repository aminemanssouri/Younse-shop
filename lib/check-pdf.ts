export interface CheckPdfRow {
  name: string;
  date: string;
  amount: string;
  bank: string;
  number: string;
  notes: string;
}

export interface CheckPdfLabels {
  shop: string;
  title: string;
  name: string;
  date: string;
  amount: string;
  bank: string;
  number: string;
  notes: string;
  total: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function styles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 28px; color: #111; background: #fff; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #555; margin-bottom: 24px; }
    .sheet { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .amount { font-size: 28px; font-weight: 700; margin: 8px 0 16px; }
    .row { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .row span { color: #555; }
    .notes { margin-top: 12px; white-space: pre-wrap; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: start; vertical-align: top; }
    th { background: #f4f4f4; }
    .total { margin-top: 16px; font-size: 16px; font-weight: 700; text-align: end; }
    @media print { body { padding: 0; } }
  `;
}

export function buildSingleCheckPdfHtml(row: CheckPdfRow, labels: CheckPdfLabels, dir: 'ltr' | 'rtl') {
  return `<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)} - ${escapeHtml(row.name)}</title>
  <style>${styles()}</style>
</head>
<body>
  <h1>${escapeHtml(labels.shop)}</h1>
  <div class="subtitle">${escapeHtml(labels.title)}</div>
  <div class="sheet">
    <div class="amount">${escapeHtml(row.amount)}</div>
    <div class="row"><span>${escapeHtml(labels.name)}</span><strong>${escapeHtml(row.name)}</strong></div>
    <div class="row"><span>${escapeHtml(labels.date)}</span><strong>${escapeHtml(row.date)}</strong></div>
    <div class="row"><span>${escapeHtml(labels.bank)}</span><strong>${escapeHtml(row.bank)}</strong></div>
    <div class="row"><span>${escapeHtml(labels.number)}</span><strong>${escapeHtml(row.number)}</strong></div>
    ${row.notes && row.notes !== '-' ? `<div class="notes"><span>${escapeHtml(labels.notes)}</span><div>${escapeHtml(row.notes)}</div></div>` : ''}
  </div>
</body>
</html>`;
}

export function buildAllChecksPdfHtml(rows: CheckPdfRow[], total: string, labels: CheckPdfLabels, dir: 'ltr' | 'rtl') {
  const body = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.amount)}</td>
      <td>${escapeHtml(row.bank)}</td>
      <td>${escapeHtml(row.number)}</td>
      <td>${escapeHtml(row.notes)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(labels.title)}</title>
  <style>${styles()}</style>
</head>
<body>
  <h1>${escapeHtml(labels.shop)}</h1>
  <div class="subtitle">${escapeHtml(labels.title)}</div>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(labels.date)}</th>
        <th>${escapeHtml(labels.name)}</th>
        <th>${escapeHtml(labels.amount)}</th>
        <th>${escapeHtml(labels.bank)}</th>
        <th>${escapeHtml(labels.number)}</th>
        <th>${escapeHtml(labels.notes)}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  <div class="total">${escapeHtml(labels.total)}: ${escapeHtml(total)}</div>
</body>
</html>`;
}

export function printHtmlDocument(html: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onafterprint = () => printWindow.close();
  setTimeout(() => printWindow.print(), 250);
  return true;
}
