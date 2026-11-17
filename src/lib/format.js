const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const inr = (n) => inrFmt.format(Number(n) || 0)
export const pad = (n, w = 5) => String(n ?? '').padStart(w, '0')
export const sessionCode = (s) => `S-${pad(s.session_no)}`

export function fmtClock(ms) {
  const t = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60
  return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':')
}
export function fmtDuration(mins) {
  mins = Math.round(Number(mins) || 0)
  const h = Math.floor(mins / 60), m = mins % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—')
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
export const fmtDT = (d) => (d ? `${fmtDate(d)}, ${fmtTime(d)}` : '—')
export const categoryName = (c) => (c === 'simulator' ? 'Racing Simulator' : 'PS5')
export const methodName = (m) => ({ cash: 'Cash', upi: 'UPI', card: 'Card', other: 'Other' }[m] || '—')
export const playersLabel = (n) => `${n} Player${n > 1 ? 's' : ''}`
