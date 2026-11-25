import { useState } from 'react'
import { 
  IndianRupee, Activity, Timer, TrendingUp, Gamepad2, Car, Users, 
  Hourglass, MonitorPlay, Zap, ArrowRight, Play, CheckCircle2, Coffee 
} from 'lucide-react'
import { useData, useNow } from '../context/DataContext'
import { useFlows } from '../components/Flows'
import { startOfDay } from '../lib/dates'
import { inr, fmtClock, fmtTime, sessionCode, playersLabel, categoryName } from '../lib/format'
import { runningBill } from '../lib/billing'
import { Spinner } from '../components/ui'

export default function Dashboard() {
  const { loading, today, active, pending, stations, stationStatus } = useData()
  const now = useNow()
  const { openCheckIn, openCheckout, openSnacks } = useFlows()
  const [filter, setFilter] = useState('all') // 'all' | 'ps5' | 'rig'

  if (loading) return <Spinner />

  const t0 = startOfDay().getTime()
  const paid = today.filter((s) => s.payment_status === 'paid' && new Date(s.check_out).getTime() >= t0)
  const revenue = paid.reduce((a, s) => a + Number(s.final_amount), 0)
  const startedToday = today.filter((s) => new Date(s.check_in).getTime() >= t0).length
  const allSessions = [...new Map([...today, ...active].map((s) => [s.id, s])).values()]
  const minutes = allSessions.reduce((a, s) => {
    const from = Math.max(new Date(s.check_in).getTime(), t0)
    const to = s.check_out ? new Date(s.check_out).getTime() : now
    return a + Math.max(0, to - from) / 60000
  }, 0)
  const free = stations.filter((s) => stationStatus(s) === 'available').length
  const busy = stations.filter((s) => stationStatus(s) === 'occupied').length
  const utilization = stations.length ? Math.round((busy / stations.length) * 100) : 0

  // Filter stations for Pod Grid
  const filteredStations = stations.filter((st) => {
    if (filter === 'ps5') return st.category === 'playstation'
    if (filter === 'rig') return st.category === 'simulator'
    return true
  })

  // Gauge calculation (180deg arc)
  const arcRadius = 56
  const arcCircumference = Math.PI * arcRadius
  const arcOffset = arcCircumference * (1 - utilization / 100)

  return (
    <div className="flex flex-col gap-6">
      {/* 1. SCULPTED "LOUNGE PULSE" HERO CARD */}
      <section className="surface-card p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-[var(--indigo-soft)] via-[var(--bg-surface)] to-[var(--emerald-soft)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-center">
          {/* Left Side: Revenue & Live KPIs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--ink-muted)]">
                TODAY'S OPERATIONS REVENUE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--emerald-soft)] text-[var(--emerald)] text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                LIVE TICKING
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-4xl sm:text-5xl font-black text-[var(--ink-primary)] tnum tracking-tight">
                {inr(revenue)}
              </span>
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                from {paid.length} settled sessions today
              </span>
            </div>

            {/* Micro Pills Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                <Activity className="w-3.5 h-3.5 text-[var(--indigo)]" />
                <span>Active:</span>
                <strong className="text-[var(--ink-primary)] font-mono">{active.length}</strong>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                <Timer className="w-3.5 h-3.5 text-[var(--coral)]" />
                <span>Playtime:</span>
                <strong className="text-[var(--ink-primary)] font-mono">{(minutes / 60).toFixed(1)}h</strong>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs text-[var(--ink-secondary)]">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Total Matches:</span>
                <strong className="text-[var(--ink-primary)] font-mono">{startedToday}</strong>
              </div>
            </div>
          </div>

          {/* Right Side: Arc Utilization Gauge & Interactive Mini Station Dots */}
          <div className="flex items-center justify-between gap-6 lg:border-l border-[var(--border-hairline)] lg:pl-6 pt-4 lg:pt-0">
            {/* SVG Arc Gauge */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-[140px] h-[85px] flex flex-col items-center justify-end">
                <svg className="absolute top-0 left-0 w-[140px] h-[85px] overflow-visible">
                  {/* Track Background */}
                  <path
                    d="M 14 75 A 56 56 0 0 1 126 75"
                    fill="none"
                    stroke="var(--bg-pill)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  {/* Progress Fill */}
                  <path
                    d="M 14 75 A 56 56 0 0 1 126 75"
                    fill="none"
                    stroke="var(--indigo)"
                    strokeWidth="11"
                    strokeDasharray={arcCircumference}
                    strokeDashoffset={arcOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <span className="font-display text-2xl font-black text-[var(--ink-primary)] tnum leading-none">
                  {utilization}%
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] mt-1">
                  UTILIZATION
                </span>
              </div>
            </div>

            {/* Quick Station Status Dots */}
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Arena Readiness ({free} Free)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stations.map((st) => {
                  const isOccupied = stationStatus(st) === 'occupied'
                  const isSim = st.category === 'simulator'
                  return (
                    <div
                      key={st.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold transition-transform hover:-translate-y-0.5 ${
                        isOccupied
                          ? isSim 
                            ? 'bg-[var(--coral-soft)] border-[var(--coral)] text-[var(--coral)]'
                            : 'bg-[var(--indigo-soft)] border-[var(--indigo)] text-[var(--indigo)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--ink-secondary)]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? (isSim ? 'bg-[var(--coral)]' : 'bg-[var(--indigo)]') : 'bg-slate-300'}`} />
                      <span>{st.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNPAID CHECKOUT QUEUE (IF ANY) */}
      {pending.length > 0 && (
        <section className="surface-card p-4 sm:p-5 border-amber-300/60 bg-gradient-to-r from-amber-500/10 via-[var(--bg-surface)] to-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-amber-500 animate-spin" />
              <h3 className="font-display text-sm font-bold text-[var(--ink-primary)]">
                Checkout Awaiting Settlement ({pending.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
              Action Required
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--ink-primary)]">{s.customer_name || 'Walk-in'} · {s.station_name}</p>
                  <p className="text-[11px] text-[var(--ink-muted)] font-mono">{fmtTime(s.check_out)}</p>
                </div>
                <button
                  onClick={() => openCheckout(s)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--emerald)] text-white text-xs font-bold hover:brightness-110 shadow-sm"
                >
                  {inr(s.final_amount)} · Pay
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ARENA POD DECK (SCULPTED 24px CARDS) */}
      <section className="flex flex-col gap-4">
        {/* Toolbar & Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-[var(--ink-primary)]">
              Live Station Pods
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-pill)] text-[var(--ink-muted)] text-xs font-extrabold">
              {stations.length}
            </span>
          </div>

          {/* Segmented Filter Control */}
          <div className="inline-flex p-1 rounded-full bg-[var(--bg-pill)] border border-[var(--border-hairline)]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              All Zones
            </button>
            <button
              onClick={() => setFilter('ps5')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'ps5' ? 'bg-[var(--bg-surface)] text-[var(--indigo)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              PlayStation 5
            </button>
            <button
              onClick={() => setFilter('rig')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'rig' ? 'bg-[var(--bg-surface)] text-[var(--coral)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              Racing Rigs
            </button>
          </div>
        </div>

        {/* Pod Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStations.map((st) => {
            const status = stationStatus(st)
            const isOccupied = status === 'occupied'
            const isSim = st.category === 'simulator'
            const currentSession = active.find((s) => s.station_id === st.id)
            const bill = currentSession ? runningBill(currentSession, now) : null
            const Icon = isSim ? Car : Gamepad2

            return (
              <div
                key={st.id}
                className={`surface-card p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 ${
                  isOccupied
                    ? isSim 
                      ? 'border-[var(--coral)] bg-gradient-to-br from-[var(--coral-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-lg shadow-[var(--coral-glow)]'
                      : 'border-[var(--indigo)] bg-gradient-to-br from-[var(--indigo-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] shadow-lg shadow-[var(--indigo-glow)]'
                    : ''
                }`}
              >
                {/* Pod Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isSim ? 'bg-[var(--coral-soft)] text-[var(--coral)]' : 'bg-[var(--indigo-soft)] text-[var(--indigo)]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--ink-primary)] leading-tight">
                        {st.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[var(--ink-muted)]">
                        {isSim ? 'Racing Simulator' : 'PlayStation 5 Bay'}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    isOccupied 
                      ? 'bg-[var(--emerald)] text-white' 
                      : 'bg-[var(--emerald-soft)] text-[var(--emerald)]'
                  }`}>
                    {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    {isOccupied ? 'IN PLAY' : 'READY'}
                  </span>
                </div>

                {/* Active Session Telemetry */}
                {isOccupied && currentSession ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)]">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block">
                          MATCH TIME
                        </span>
                        <p className="font-mono text-lg font-black text-[var(--ink-primary)] tnum">
                          {fmtClock(now - new Date(currentSession.check_in).getTime())}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block">
                          RUNNING FARE
                        </span>
                        <p className="font-display text-lg font-black text-[var(--emerald)] tnum">
                          {inr(bill?.total || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--ink-secondary)] px-1">
                      <span className="font-bold">{currentSession.customer_name || 'Walk-in Gamer'}</span>
                      <span className="font-semibold">{playersLabel(currentSession.players)}</span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openSnacks(currentSession)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-pill)] hover:bg-[var(--bg-pill-hover)] text-[var(--ink-primary)] text-xs font-bold transition-all"
                      >
                        <Coffee className="w-3.5 h-3.5 text-[var(--indigo)]" />
                        <span>Snacks</span>
                      </button>
                      <button
                        onClick={() => openCheckout(currentSession)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-white text-xs font-bold transition-all shadow-sm ${
                          isSim ? 'bg-[var(--coral)] hover:bg-[var(--coral-hover)]' : 'bg-[var(--indigo)] hover:bg-[var(--indigo-hover)]'
                        }`}
                      >
                        <span>End & Bill</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty Station Quick Launch Bar */
                  <button
                    onClick={() => openCheckIn(st)}
                    className="w-full py-3 px-4 rounded-2xl bg-[var(--bg-pill)] hover:bg-[var(--indigo)] text-[var(--ink-primary)] hover:text-white flex items-center justify-between text-xs font-bold transition-all group"
                  >
                    <span>Quick Check-In Station</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
