import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { startOfDay } from '../lib/dates'
import { useAuth } from './AuthContext'

const DataCtx = createContext(null)
const ClockCtx = createContext(Date.now())
export const useData = () => useContext(DataCtx)
// Server-synchronised "now" (ms). Ticks every second; the value is always derived
// from the clock, never from counting ticks, so refreshes and sleeps cannot drift.
export const useNow = () => useContext(ClockCtx)

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })

export function DataProvider({ children }) {
  const { profile } = useAuth()
  const [data, setData] = useState({ stations: [], rules: [], discounts: [], snacks: [], settings: null, active: [], pending: [], today: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [now, setNow] = useState(Date.now())
  const offset = useRef(0)
  const timer = useRef(null)

  const load = useCallback(async () => {
    try {
      const ts = startOfDay().toISOString()
      const t0 = Date.now()
      const [st, ru, di, snk, se, ac, pe, td, sn] = await Promise.all([
        supabase.from('gaming_stations').select('*').eq('active', true),
        supabase.from('pricing_rules').select('*').order('hourly_rate'),
        supabase.from('discounts').select('*').order('name'),
        supabase.from('snacks').select('*').order('name'),
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('gaming_sessions').select('*').eq('status', 'active').order('check_in'),
        supabase.from('gaming_sessions').select('*').eq('status', 'ended').order('check_out'),
        supabase.from('gaming_sessions').select('*').or(`check_in.gte.${ts},check_out.gte.${ts}`).order('check_in', { ascending: false }),
        supabase.rpc('server_now'),
      ])
      const failed = [st, ru, di, snk, se, ac, pe, td, sn].find((r) => r.error)
      if (failed) throw failed.error
      const t1 = Date.now()
      offset.current = new Date(sn.data).getTime() - (t0 + t1) / 2
      setNow(Date.now() + offset.current)
      setData({ stations: st.data.sort(byName), rules: ru.data, discounts: di.data, snacks: snk.data || [], settings: se.data, active: ac.data, pending: pe.data, today: td.data })
      setError(null)
    } catch (e) {
      setError(e.message || 'Could not reach the server')
    } finally {
      setLoading(false)
    }
  }, [])

  const debounced = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(load, 250)
  }, [load])

  useEffect(() => {
    if (!profile?.active) return
    load()
    const ch = supabase.channel('pp-live')
    ;['gaming_sessions', 'gaming_stations', 'pricing_rules', 'discounts', 'settings'].forEach((t) =>
      ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, debounced))
    ch.subscribe()
    const poll = setInterval(load, 30000)
    const tick = setInterval(() => setNow(Date.now() + offset.current), 1000)
    const onFocus = () => { setNow(Date.now() + offset.current); load() }
    const on = () => { setOnline(true); load() }
    const off = () => setOnline(false)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      supabase.removeChannel(ch)
      clearInterval(poll); clearInterval(tick); clearTimeout(timer.current)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [profile?.active, load, debounced])

  const value = useMemo(() => {
    const sessionByStation = Object.fromEntries(data.active.map((s) => [s.station_id, s]))
    // An active session is the source of truth for "occupied".
    const stationStatus = (st) => (sessionByStation[st.id] ? 'occupied' : st.status === 'maintenance' ? 'maintenance' : 'available')
    return { ...data, loading, error, online, reload: load, sessionByStation, stationStatus }
  }, [data, loading, error, online, load])

  return (
    <DataCtx.Provider value={value}>
      <ClockCtx.Provider value={now}>{children}</ClockCtx.Provider>
    </DataCtx.Provider>
  )
}
