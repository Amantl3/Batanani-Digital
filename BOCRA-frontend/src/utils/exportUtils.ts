/**
 * Client-side export utilities — no extra dependencies.
 * Uses native browser APIs for CSV and a printable HTML page for PDF.
 * 
 * PRODUCTION NOTE: prefer calling the backend export endpoint
 * (/admin/applications/export?format=csv) for full-dataset exports.
 * These helpers export whatever is currently loaded in the table.
 */

// ── CSV export ─────────────────────────────────────────────────────────────────
export function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const esc = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
}

// ── Print-to-PDF via browser print dialog ─────────────────────────────────────
export function exportToPDF(
  title:    string,
  headers:  string[],
  rows:     (string | number)[][],
  filename: string,
) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${filename}</title>
  <style>
    body { font-family: sans-serif; margin: 24px; color: #0D1F3C; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    p  { font-size: 11px; color: #64748b; margin-bottom: 16px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th { background:#0D1F3C; color:#fff; padding:8px 10px; text-align:left; }
    td { padding:7px 10px; border-bottom:1px solid #e2e8f0; }
    tr:nth-child(even) td { background:#f8fafc; }
  </style>
</head>
<body>
  <h1>BOCRA — ${title}</h1>
  <p>Generated: ${new Date().toLocaleString('en-BW')}</p>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
  <script>window.onload = () => { window.print(); setTimeout(window.close, 500) }<\/script>
</body>
</html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}

// ── Fee schedule PDF ───────────────────────────────────────────────────────────
export function exportFeeSchedulePDF() {
  exportToPDF('Regulatory Fee Schedule 2025/26', ['Category', 'Annual fee', 'Notes'], [
    ['Telecommunications licence', 'BWP 44,000 – 200,000', 'Based on revenue tier'],
    ['Internet service provider',  'BWP 20,000 – 80,000',  'Based on subscriber base'],
    ['Broadcasting licence',       'BWP 15,000 – 120,000', 'Free-to-air vs pay TV'],
    ['Postal / courier service',   'BWP 5,000 – 30,000',   'Based on coverage area'],
    ['Type approval (per device)', 'BWP 2,500',             'One-time per device model'],
    ['Spectrum utilisation fee',   'BWP 8,000 – 50,000',   'Based on bandwidth & region'],
    ['Domain registration (.bw)',  'BWP 200',               'Per domain per year'],
    ['Licence amendment fee',      'BWP 2,200',             'Per amendment request'],
  ], 'BOCRA-fee-schedule-2025-26')
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}