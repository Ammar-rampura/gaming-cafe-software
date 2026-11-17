import { Square, Users, Clock, Coffee, Plus } from 'lucide-react'
import { Badge, Button, Card } from './ui'
import { useNow } from '../context/DataContext'
import { useFlows } from './Flows'
import { inr, fmtClock, fmtTime, playersLabel, categoryName } from '../lib/format'
import { runningBill } from '../lib/billing'

export default function SessionCard({ s }) {
  const now = useNow()
  const { openCheckout, openSnacks } = useFlows()
  const bill = runningBill(s, now)
  const isSimulator = s.category === 'simulator'
  const snacksCount = (s.snacks || []).reduce((sum, i) => sum + (Number(i.qty) || 1), 0)

  return (
    <Card className="group relative overflow-hidden border-slate-200/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/10 flex flex-col justify-between">
      {/* Top accent line */}
      <div className={`absolute left-0 top-0 h-1 w-full ${isSimulator ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-brand-500 to-indigo-600'}`} />

      <div>
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-sm font-bold text-slate-900">{s.customer_name || 'Walk-in Player'}</p>
            </div>
            <p className="text-xs font-semibold text-slate-500">{s.station_name} · <span className={isSimulator ? 'text-cyan-700 font-bold' : 'text-brand-700 font-bold'}>{categoryName(s.category)}</span></p>
          </div>
          <Badge tone="green" className="shrink-0">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            <span>IN MATCH</span>
          </Badge>
        </div>

        <div className="my-3 flex items-baseline justify-between rounded-xl bg-slate-50/80 p-3 border border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">Session Time</span>
            <p className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tnum">{fmtClock(now - new Date(s.check_in).getTime())}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">Live Total</span>
            <p className="font-display text-xl font-black text-brand-700 tnum">{inr(bill.total)}</p>
            {bill.snacksTotal > 0 && (
              <span className="text-[10px] font-bold text-slate-500 block">incl. {inr(bill.snacksTotal)} snacks</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" />{playersLabel(s.players)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />In at {fmtTime(s.check_in)}</span>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-slate-700 border-slate-200" 
          onClick={() => openSnacks(s)}
          title="Add drinks & snacks to session"
        >
          <Coffee className="h-3.5 w-3.5 text-brand-600" />
          <span>Snacks {snacksCount > 0 ? `(${snacksCount})` : ''}</span>
        </Button>
        <Button 
          variant="dangerSoft" 
          size="sm" 
          className="flex-1 font-bold" 
          onClick={() => openCheckout(s)}
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          <span>End</span>
        </Button>
      </div>
    </Card>
  )
}
