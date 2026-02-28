import * as XLSX from 'xlsx';

export function generateExcelExport(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  sheetName: string = 'Sheet1',
): Buffer {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => {
    const val = row[c.key];
    if (val instanceof Date) return val.toISOString();
    if (val === null || val === undefined) return '';
    return String(val);
  }));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buf);
}

export function generatePdfTable(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  title: string,
): Buffer {
  const headerRow = columns.map((c) => `<th style="border:1px solid #ccc;padding:6px 10px;text-align:left;background:#f5f5f5;font-size:12px">${c.header}</th>`).join('');
  const bodyRows = data.map((row) => {
    const cells = columns.map((c) => {
      const val = row[c.key];
      const display = val instanceof Date ? val.toISOString().split('T')[0] : (val ?? '');
      return `<td style="border:1px solid #ccc;padding:6px 10px;font-size:11px">${display}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;margin:20px">
<h2 style="font-size:16px;margin-bottom:10px">${title}</h2>
<p style="font-size:11px;color:#666;margin-bottom:15px">Generated: ${new Date().toISOString()}</p>
<table style="border-collapse:collapse;width:100%">
<thead><tr>${headerRow}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</body></html>`;

  return Buffer.from(html, 'utf-8');
}
