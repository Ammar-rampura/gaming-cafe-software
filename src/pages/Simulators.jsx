import { useEffect, useState } from 'react'
import { Car, Cog, Disc3, Armchair, Gauge, Footprints } from 'lucide-react'
import { PageHeader, Card, Spinner } from '../components/ui'
import StationGrid from '../components/StationGrid'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import { inr, fmtDT, fmtDuration, sessionCode, methodName } from '../lib/format'
import { BILLING_METHODS } from '../lib/billing'

export default function Simulators() {
  const { loading, rules, settings, stations, active } = useData()
  const [recent, setRecent] = useState([])
  useEffect(() => {
    supabase.from('gaming_sessions').select('*').eq('category', 'simulator').neq('status', 'active').order('check_in', { ascending: false }).limit(10)
      .then(({ data }) => setRecent(data || []))
  }, [active.length])
  if (loading) return <Spinner />
  const simRules = rules.filter((r) => r.category === 'simulator' && r.active)
  const name = (id) => stations.find((s) => s.id === id)?.name

  return (
    <>
      <PageHeader title="Racing Simulators" sub="Managed separately from PlayStation, with their own pricing and history." />
      <StationGrid category="simulator" />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-3 font-display font-bold">Simulator rig</h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            {[[Disc3, 'Steering wheel'], [Cog, 'Gear shifter'], [Footprints, 'Clutch'], [Gauge, 'Racing pedals'], [Armchair, 'Simulator seat']].map(([I, t]) => (
              <li key={t} className="flex items-center gap-2.5"><I className="h-4 w-4 text-brand-600" />{t}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-display font-bold">Simulator pricing</h3>
          {simRules.length === 0 ? <p className="text-sm text-slate-500">No simulator pricing yet. Add it in Admin Settings → Pricing.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {simRules.map((r) => <li key={r.id} className="flex justify-between py-2"><span>{r.label}{r.station_id && <span className="text-slate-400"> · {name(r.station_id)}</span>}</span><span className="font-semibold tnum">{inr(r.hourly_rate)}/hr</span></li>)}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-500">Billing: {BILLING_METHODS[settings?.billing_method]}</p>
        </Card>
        <Card className="overflow-hidden lg:col-span-1">
          <h3 className="px-5 pt-5 font-display font-bold">Recent simulator sessions</h3>
          <ul className="divide-y divide-slate-100 p-2 text-sm">
            {recent.length === 0 && <li className="p-4 text-slate-500">No simulator sessions yet.</li>}
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0"><p className="truncate font-medium">{s.customer_name || 'Walk-in'} · {s.station_name}</p><p className="text-xs text-slate-500">{sessionCode(s)} · {fmtDT(s.check_in)} · {fmtDuration(s.duration_minutes)}</p></div>
                <div className="text-right"><p className="font-semibold tnum">{inr(s.final_amount)}</p><p className="text-xs text-slate-500">{s.payment_status === 'paid' ? methodName(s.payment_method) : 'Unpaid'}</p></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
