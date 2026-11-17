import { IndianRupee, Activity, CheckCircle2, Timer, TrendingUp, Gamepad2, Users, Hourglass, MonitorPlay, Zap, Trophy, ShieldCheck } from 'lucide-react'
import { PageHeader, Card, Button, Empty, Spinner, Badge } from '../components/ui'
import SessionCard from '../components/SessionCard'
import { useData, useNow } from '../context/DataContext'
import { useFlows } from '../components/Flows'
import { startOfDay } from '../lib/dates'
import { inr, fmtDuration, fmtTime, sessionCode } from '../lib/format'

function Stat({ icon: Icon, label, value, sub, tone = 'from-brand-500/10 to-indigo-500/10 text-brand-600 border-brand-200/60' }) {
  return (
    <Card className="relative overflow-hidden p-4 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3.5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br border ${tone} transition-transform group-hover:scale-105`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="font-display text-xl font-extrabold text-slate-900 tnum tracking-tight">{value}</p>
          {sub && <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { loading, today, active, pending, stations, stationStatus } = useData()
  const now = useNow()
  const { openCheckIn, openCheckout } = useFlows()
  if (loading) return <Spinner />

  const t0 = startOfDay().getTime()
  const paid = today.filter((s) => s.payment_status === 'paid' && new Date(s.check_out).getTime() >= t0)
  const revenue = paid.reduce((a, s) => a + Number(s.final_amount), 0)
  const startedToday = today.filter((s) => new Date(s.check_in).getTime() >= t0).length
  const all = [...new Map([...today, ...active].map((s) => [s.id, s])).values()]
  const minutes = all.reduce((a, s) => {
    const from = Math.max(new Date(s.check_in).getTime(), t0)
    const to = s.check_out ? new Date(s.check_out).getTime() : now
    return a + Math.max(0, to - from) / 60000
  }, 0)
  const free = stations.filter((s) => stationStatus(s) === 'available').length
  const busy = stations.filter((s) => stationStatus(s) === 'occupied').length

  return (
    <>
      <PageHeader 
        title="Command Center" 
        sub="Real-time telemetrics, active gaming sessions, and live cafe revenue." 
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat 
          icon={IndianRupee} 
          label="Today's Revenue" 
          value={inr(revenue)} 
          tone="from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200" 
        />
        <Stat 
          icon={Activity} 
          label="Active Sessions" 
          value={active.length} 
          sub={`${busy} stations currently in play`}
          tone="from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200" 
        />
        <Stat 
          icon={Gamepad2} 
          label="Total Sessions" 
          value={startedToday} 
          tone="from-brand-500/10 to-purple-500/10 text-brand-600 border-brand-200" 
        />
        <Stat 
          icon={Timer} 
          label="Playtime Logged" 
          value={`${(minutes / 60).toFixed(1)} hrs`} 
          tone="from-indigo-500/10 to-violet-500/10 text-indigo-600 border-indigo-200" 
        />
        <Stat 
          icon={TrendingUp} 
          label="Avg / Session" 
          value={inr(paid.length ? revenue / paid.length : 0)} 
          tone="from-teal-500/10 to-emerald-500/10 text-teal-600 border-teal-200" 
        />
        <Stat 
          icon={MonitorPlay} 
          label="Available Stations" 
          value={free} 
          sub={`Ready out of ${stations.length}`}
          tone="from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200" 
        />
        <Stat 
          icon={Users} 
          label="Station Utilization" 
          value={stations.length ? `${Math.round((busy / stations.length) * 100)}%` : '0%'} 
          tone="from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200" 
        />
        <Stat 
          icon={CheckCircle2} 
          label="Paid Invoices" 
          value={paid.length} 
          tone="from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200" 
        />
      </div>

      {pending.length > 0 && (
        <Card className="mt-6 border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-amber-50/70 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-amber-900">
              <Hourglass className="h-4 w-4 text-amber-600 animate-spin" />
              <span>Checkout Queue ({pending.length} unpaid)</span>
            </p>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Action Needed</span>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {pending.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/60 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                <div className="min-w-0 text-sm">
                  <p className="truncate font-display font-bold text-slate-800">{s.customer_name || 'Walk-in'} · <span className="text-brand-600">{s.station_name}</span></p>
                  <p className="text-xs text-slate-500">{sessionCode(s)} · {fmtTime(s.check_out)} · {fmtDuration(s.duration_minutes)}</p>
                </div>
                <Button size="sm" variant="success" className="font-bold" onClick={() => openCheckout(s)}>
                  {inr(s.final_amount)} · Pay
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-4 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-600 fill-current" />
          <h2 className="font-display text-lg font-extrabold tracking-tight text-slate-900">Live Gaming Arenas</h2>
        </div>
        <Badge tone="violet" className="px-3 py-1 font-extrabold">{active.length} ACTIVE NOW</Badge>
      </div>

      {active.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-white/50">
          <Empty icon={Gamepad2} title="No active matches">
            All stations and simulators are free. Start a new session when players arrive.
          </Empty>
          <div className="pb-8 text-center">
            <Button onClick={() => openCheckIn()} className="shadow-brand-600/30">
              <Gamepad2 className="h-4 w-4" />
              <span>Start New Session</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {active.map((s) => <SessionCard key={s.id} s={s} />)}
        </div>
      )}
    </>
  )
}
