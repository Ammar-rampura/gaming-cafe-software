// Mirrors the SQL functions calc_amount / calc_discount in supabase/schema.sql.
// The database is the source of truth at checkout; this is used for live estimates.
export const BILLING_METHODS = {
  per_minute: 'Per minute (proportional)',
  per_30_min: 'Per 30 minutes',
  per_hour: 'Per hour (rounded up)',
}

export function calcAmount(minutes, rate, method) {
  rate = Number(rate)
  if (minutes <= 0) return 0
  if (method === 'per_30_min') return Math.round((Math.ceil(minutes / 30) * rate) / 2)
  if (method === 'per_hour') return Math.round(Math.ceil(minutes / 60) * rate)
  return Math.round((minutes * rate) / 60)
}

export function calcDiscount(sub, type, value) {
  value = Number(value) || 0
  if (!type || value <= 0) return 0
  const d = type === 'percent' ? Math.round((sub * Math.min(value, 100)) / 100) : Math.round(value)
  return Math.min(sub, d)
}

export function elapsedMinutes(checkIn, nowMs) {
  const secs = (nowMs - new Date(checkIn).getTime()) / 1000
  return Math.max(0, Math.ceil(secs / 60))
}

// Live bill for a running session, derived from stored check-in time and snacks.
export function runningBill(s, nowMs) {
  const minutes = elapsedMinutes(s.check_in, nowMs)
  const subtotal = calcAmount(minutes, s.hourly_rate, s.billing_method)
  const discount = calcDiscount(subtotal, s.discount_type, s.discount_value)
  const snacksTotal = (s.snacks || []).reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)
  return { 
    minutes, 
    subtotal, 
    discount, 
    snacksTotal,
    total: Math.max(0, subtotal - discount) + snacksTotal 
  }
}

export function rulesFor(rules, station, players) {
  const list = rules.filter(
    (r) => r.active && r.category === station.category && r.players === players && (!r.station_id || r.station_id === station.id)
  )
  const specific = list.filter((r) => r.station_id === station.id)
  return specific.length ? specific : list
}

export function playerOptions(rules, station) {
  const set = new Set(
    rules.filter((r) => r.active && r.category === station.category && (!r.station_id || r.station_id === station.id)).map((r) => r.players)
  )
  return [...set].sort((a, b) => a - b)
}
