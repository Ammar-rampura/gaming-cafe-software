export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
export const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}` }

export const PRESETS = [
  ['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['month', 'This month'], ['custom', 'Custom'],
]

export function rangeFor(preset, from, to) {
  const now = new Date()
  if (preset === 'today') return { from: startOfDay(now), to: endOfDay(now) }
  if (preset === 'yesterday') { const y = addDays(now, -1); return { from: startOfDay(y), to: endOfDay(y) } }
  if (preset === '7d') return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) }
  if (preset === 'month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) }
  const f = from ? startOfDay(new Date(from)) : startOfDay(now)
  const t = to ? endOfDay(new Date(to)) : endOfDay(now)
  return { from: f, to: t }
}
