import * as XLSX from 'xlsx'

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// rows: array of plain objects (keys = column headings)
export function exportCSV(rows, name) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const text = [cols.map(esc).join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
  download(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' }), `${name}.csv`)
}

// sheets: { 'Sheet name': rows[] }
export function exportXLSX(sheets, name) {
  const wb = XLSX.utils.book_new()
  Object.entries(sheets).forEach(([title, rows]) => {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), title.slice(0, 31))
  })
  XLSX.writeFile(wb, `${name}.xlsx`)
}
