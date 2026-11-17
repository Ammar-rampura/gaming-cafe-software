import { useEffect, useMemo, useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { PageHeader, Card, Button, Spinner, useToast } from '../components/ui'
import DateFilter from '../components/DateFilter'
import { supabase } from '../lib/supabase'
import { rangeFor, startOfDay, addDays, dayKey } from '../lib/dates'
import { exportCSV, exportXLSX } from '../lib/export'
import { inr, fmtDT, sessionCode, methodName, categoryName } from '../lib/format'

const COLORS = ['#6a3df0', '#22c55e', '#f59e0b', '#06b6d4', '#ef4444']
const sum = (a) => a.reduce((x, s) => x + Number(s.final_amount), 0)

function Big({ label, value, sub }) {
  return <Card className="p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 font-display text-2xl font-bold tnum">{value}</p>{sub && <p className="text-xs text-slate-400">{sub}</p>}</Card>
}

export default function Reports() {
  const toast = useToast()
  const [preset, setPreset] = useState('7d')
  const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true)
  const range = useMemo(() => rangeFor(preset, from, to), [preset, from, to])

  useEffect(() => {
    let live = true
    setLoading(true)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const earliest = new Date(Math.min(range.from, monthStart, addDays(startOfDay(), -6)))
    supabase.from('gaming_sessions').select('*').eq('status', 'completed').gte('check_out', earliest.toISOString()).order('check_out').limit(20000)
      .then(({ data, error }) => { if (!live) return; if (error) toast(error.message, 'err'); setRows(data || []); setLoading(false) })
    return () => { live = false }
  }, [range.from.getTime()])

  const at = (s) => new Date(s.check_out).getTime()
  const today0 = startOfDay().getTime()
  const todayRows = rows.filter((s) => at(s) >= today0)
  const weekRows = rows.filter((s) => at(s) >= addDays(startOfDay(), -6).getTime())
  const monthRows = rows.filter((s) => at(s) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime())
  const inRange = rows.filter((s) => at(s) >= range.from.getTime() && at(s) <= range.to.getTime())

  const daily = useMemo(() => {
    const m = new Map()
    for (let d = startOfDay(range.from); d <= range.to && m.size < 93; d = addDays(d, 1)) m.set(dayKey(d), { day: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue: 0, sessions: 0 })
    inRange.forEach((s) => { const r = m.get(dayKey(s.check_out)); if (r) { r.revenue += Number(s.final_amount); r.sessions++ } })
    return [...m.values()]
  }, [inRange, range])

  const group = (fn) => { const m = {}; inRange.forEach((s) => { const k = fn(s); m[k] = (m[k] || 0) + Number(s.final_amount) }); return Object.entries(m).map(([name, value]) => ({ name, value })) }
  const byCategory = group((s) => categoryName(s.category))
  const byPlayers = group((s) => (s.category === 'simulator' ? 'Simulator' : `${s.players} Player${s.players > 1 ? 's' : ''}`)).sort((a, b) => a.name.localeCompare(b.name))
  const pay = (m) => sum(inRange.filter((s) => s.payment_method === m))
  const byMethod = ['cash', 'upi', 'card', 'other'].map((m) => ({ name: methodName(m), value: pay(m) }))

  const summary = [
    { Metric: 'Period', Value: `${fmtDT(range.from)} to ${fmtDT(range.to)}` }, { Metric: 'Total revenue', Value: sum(inRange) }, { Metric: 'Completed sessions', Value: inRange.length },
    { Metric: 'PS5 revenue', Value: sum(inRange.filter((s) => s.category === 'ps5')) }, { Metric: 'Simulator revenue', Value: sum(inRange.filter((s) => s.category === 'simulator')) },
    { Metric: 'Cash', Value: pay('cash') }, { Metric: 'UPI', Value: pay('upi') }, { Metric: 'Card', Value: pay('card') }, { Metric: 'Other', Value: pay('other') },
  ]
  const sessionsSheet = inRange.map((s) => ({ 'Session ID': sessionCode(s), Customer: s.customer_name || '', Station: s.station_name, Category: categoryName(s.category), Players: s.players, 'Check-in': fmtDT(s.check_in), 'Check-out': fmtDT(s.check_out), 'Minutes': s.duration_minutes, Amount: s.final_amount, Method: methodName(s.payment_method) }))
  const dailySheet = daily.map((d) => ({ Day: d.day, Sessions: d.sessions, Revenue: d.revenue }))
  const tip = (v) => inr(v)

  return (
    <>
      <PageHeader title="Revenue & Reports" sub="Based on completed, paid sessions.">
        <Button variant="outline" disabled={!inRange.length} onClick={() => exportCSV(sessionsSheet, 'power-play-report')}><Download className="h-4 w-4" />CSV</Button>
        <Button variant="outline" disabled={!inRange.length} onClick={() => exportXLSX({ Summary: summary, Daily: dailySheet, Sessions: sessionsSheet }, 'power-play-report')}><FileSpreadsheet className="h-4 w-4" />Excel</Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <Big label="Today's revenue" value={inr(sum(todayRows))} sub={`${todayRows.length} sessions`} />
        <Big label="Weekly revenue (last 7 days)" value={inr(sum(weekRows))} sub={`${weekRows.length} sessions`} />
        <Big label="Monthly revenue (this month)" value={inr(sum(monthRows))} sub={`${monthRows.length} sessions`} />
      </div>

      <Card className="my-6 p-4"><DateFilter {...{ preset, setPreset, from, setFrom, to, setTo }} /></Card>
      {loading ? <Spinner /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Big label="Revenue (selected period)" value={inr(sum(inRange))} />
            <Big label="Completed sessions" value={inRange.length} />
            <Big label="PS5 gaming" value={inr(sum(inRange.filter((s) => s.category === 'ps5')))} />
            <Big label="Racing simulators" value={inr(sum(inRange.filter((s) => s.category === 'simulator')))} />
            <Big label="Cash collections" value={inr(pay('cash'))} />
            <Big label="UPI collections" value={inr(pay('upi'))} />
            <Big label="Card collections" value={inr(pay('card'))} />
            <Big label="Other payments" value={inr(pay('other'))} />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-2">
              <h3 className="mb-4 font-display font-bold">Revenue by day</h3>
              <div className="h-72"><ResponsiveContainer><BarChart data={daily}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} /><Tooltip formatter={tip} /><Bar dataKey="revenue" name="Revenue" fill="#6a3df0" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
            <Card className="p-5">
              <h3 className="mb-4 font-display font-bold">PS5 vs Simulator</h3>
              <div className="h-72"><ResponsiveContainer><PieChart><Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>{byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Pie><Tooltip formatter={tip} /><Legend /></PieChart></ResponsiveContainer></div>
            </Card>
            <Card className="p-5 xl:col-span-2">
              <h3 className="mb-4 font-display font-bold">Revenue by player category</h3>
              <div className="h-64"><ResponsiveContainer><BarChart data={byPlayers} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} /><Tooltip formatter={tip} /><Bar dataKey="value" name="Revenue" fill="#22c55e" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
            <Card className="p-5">
              <h3 className="mb-4 font-display font-bold">Payment methods</h3>
              <div className="h-64"><ResponsiveContainer><PieChart><Pie data={byMethod.filter((m) => m.value > 0)} dataKey="value" nameKey="name" outerRadius={85}>{byMethod.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}</Pie><Tooltip formatter={tip} /><Legend /></PieChart></ResponsiveContainer></div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
