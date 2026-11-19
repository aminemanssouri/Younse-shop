function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function salesPdfDocument(options: {
  title: string;
  heading: string;
  subtitle: string;
  dir: 'ltr' | 'rtl';
  body: string;
}) {
  const { title, heading, subtitle, dir, body } = options;

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #431407;
      background: #fff7ed;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      background: #fff;
      border: 3px solid #f97316;
      border-radius: 18px;
      overflow: hidden;
    }
    .banner {
      background: linear-gradient(120deg, #fde047 0%, #fb923c 52%, #ea580c 100%);
      text-align: center;
      padding: 18px 20px 16px;
      border-bottom: 4px solid #c2410c;
    }
    .basmala {
      font-family: "Traditional Arabic", "Amiri", "Scheherazade New", "Times New Roman", serif;
      direction: rtl;
      font-size: 34px;
      line-height: 1.35;
      color: #7c2d12;
      font-weight: 700;
    }
    .ornament {
      width: 180px;
      height: 2px;
      margin: 8px auto 6px;
      background: linear-gradient(90deg, transparent, #7c2d12, transparent);
    }
    .shop {
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 700;
      color: #9a3412;
    }
    h1 {
      margin-top: 4px;
      font-size: 26px;
      color: #431407;
    }
    .subtitle {
      margin-top: 4px;
      font-size: 14px;
      color: #7c2d12;
    }
    .content { padding: 16px 18px 20px; }
    h2 {
      margin: 18px 0 8px;
      color: #c2410c;
      font-size: 16px;
      border-bottom: 2px solid #fdba74;
      padding-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    th {
      background: #f97316;
      color: #fff;
      text-align: start;
      padding: 8px 6px;
      font-weight: 700;
    }
    td {
      padding: 7px 6px;
      border-bottom: 1px solid #fed7aa;
      text-align: start;
      vertical-align: top;
    }
    tbody tr:nth-child(odd) { background: #fffbeb; }
    tbody tr:nth-child(even) { background: #ffedd5; }
    .negative { color: #b91c1c; font-weight: 700; }
    .summary {
      margin-top: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .summary-item {
      background: #fff7ed;
      border: 1px solid #fdba74;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .summary-item.total {
      grid-column: 1 / -1;
      background: linear-gradient(90deg, #fde047, #fb923c);
      border: none;
      font-size: 16px;
      color: #431407;
    }
    .summary-item strong { font-weight: 800; }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="banner">
      <div class="basmala">بسم الله الرحمن الرحيم</div>
      <div class="ornament"></div>
      <div class="shop">Younes Shop</div>
      <h1>${escapeHtml(heading)}</h1>
      <div class="subtitle">${escapeHtml(subtitle)}</div>
    </header>
    <div class="content">
      ${body}
    </div>
  </div>
</body>
</html>`;
}
