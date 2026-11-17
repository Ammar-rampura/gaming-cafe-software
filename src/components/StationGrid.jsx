import { Wrench, Play, Gamepad2, Car, Users, Square, Coffee } from 'lucide-react'
import { Badge, Button, Card, Empty, useToast } from './ui'
import { useData, useNow } from '../context/DataContext'
import { useFlows } from './Flows'
import { rpc } from '../lib/api'
import { inr, fmtClock, fmtTime, playersLabel } from '../lib/format'
import { runningBill } from '../lib/billing'

function StationCard({ st }) {
  const { stationStatus, sessionByStation, reload } = useData()
  const now = useNow()
  const toast = useToast()
  const { openCheckIn, openCheckout, openSnacks } = useFlows()
  const status = stationStatus(st)
  const s = sessionByStation[st.id]
  const isSimulator = st.category === 'simulator'
  const Icon = isSimulator ? Car : Gamepad2
  
  const tone = { available: 'green', occupied: 'violet', maintenance: 'amber' }[status]
  const setStatus = async (v) => { 
    try { 
      await rpc('set_station_status', { p_station: st.id, p_status: v })
      reload() 
    } catch (e) { 
      toast(e.message, 'err') 
    } 
  }

  const borderAccents = {
    available: 'border-slate-200/90 hover:border-emerald-300 hover:shadow-emerald-500/10',
    occupied: isSimulator 
      ? 'border-cyan-300 bg-gradient-to-b from-cyan-50/40 via-white to-white shadow-cyan-500/10' 
      : 'border-brand-300 bg-gradient-to-b from-brand-50/40 via-white to-white shadow-brand-500/10',
    maintenance: 'border-amber-200 bg-amber-50/20'
  }[status]

  const snacksCount = (s?.snacks || []).reduce((sum, i) => sum + (Number(i.qty) || 1), 0)

  return (
    <Card className={`group relative flex flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${borderAccents}`}>
      {/* Top status neon strip */}
      <div className={`absolute left-0 top-0 h-1 w-full rounded-t-2xl transition-all ${
        status === 'available' ? 'bg-emerald-500' :
        status === 'occupied' ? (isSimulator ? 'bg-cyan-500' : 'bg-brand-600') :
        'bg-amber-400'
      }`} />

      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className={`grid h-10 w-10 place-items-center rounded-xl border shadow-sm ${
            isSimulator 
              ? 'bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 border-cyan-200' 
              : 'bg-gradient-to-br from-brand-50 to-indigo-50 text-brand-600 border-brand-200'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-extrabold text-sm text-slate-900 tracking-tight">{st.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isSimulator ? 'Motion Simulator' : 'PlayStation 5'}
            </p>
          </div>
        </div>
        <Badge tone={tone}>
          {status === 'available' ? 'AVAILABLE' : status === 'occupied' ? 'IN USE' : 'SERVICE'}
        </Badge>
      </div>

      <div className="mt-4 flex-1">
        {status === 'occupied' && s && (() => {
          const bill = runningBill(s, now)
          return (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="truncate text-xs font-bold text-slate-800">{s.customer_name || 'Walk-in Player'}</p>
                <span className="text-[10px] font-bold text-slate-400">{playersLabel(s.players)}</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="font-mono text-xl sm:text-2xl font-bold text-slate-900 tnum tracking-tight">
                  {fmtClock(now - new Date(s.check_in).getTime())}
                </p>
                <div className="text-right">
                  <p className="font-display text-lg font-black text-brand-700 tnum">
                    {inr(bill.total)}
                  </p>
                  {bill.snacksTotal > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 block">incl. {inr(bill.snacksTotal)} snacks</span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400">Checked in at {fmtTime(s.check_in)}</p>
            </div>
          )
        })()}

        {status === 'available' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-700">Station Ready</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click Start to register players</p>
          </div>
        )}

        {status === 'maintenance' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Wrench className="h-5 w-5 text-amber-500 mb-1" />
            <p className="text-xs font-bold text-amber-800">Under Maintenance</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">Hardware check / servicing</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {status === 'available' && (
          <>
            <Button className="flex-1 shadow-brand-600/25" onClick={() => openCheckIn(st.id)}>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start</span>
            </Button>
            <Button variant="outline" size="md" onClick={() => setStatus('maintenance')} aria-label="Mark under maintenance" title="Mark under maintenance">
              <Wrench className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {status === 'occupied' && (
          <>
            <Button variant="outline" size="sm" className="px-3" onClick={() => openSnacks(s)} title="Add Snacks & Drinks">
              <Coffee className="h-4 w-4 text-brand-600" />
              <span className="hidden sm:inline">Snacks {snacksCount > 0 ? `(${snacksCount})` : ''}</span>
            </Button>
            <Button variant="dangerSoft" size="sm" className="flex-1 font-bold" onClick={() => openCheckout(s)}>
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>End Session</span>
            </Button>
          </>
        )}
        {status === 'maintenance' && (
          <Button variant="outline" className="flex-1 font-bold" onClick={() => setStatus('available')}>
            Mark Available
          </Button>
        )}
      </div>
    </Card>
  )
}

export default function StationGrid({ category }) {
  const { stations } = useData()
  const list = stations.filter((s) => !category || s.category === category)
  if (!list.length) {
    return (
      <Card>
        <Empty icon={Gamepad2} title="No stations found">
          Configure stations in System Settings → Stations.
        </Empty>
      </Card>
    )
  }
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {list.map((st) => <StationCard key={st.id} st={st} />)}
    </div>
  )
}
