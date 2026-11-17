import { useEffect, useMemo, useState } from 'react'
import { Search, Download, FileSpreadsheet, History as HistoryIcon, Receipt, Filter } from 'lucide-react'
import { PageHeader, Card, Input, Select, Button, Badge, Empty, Spinner, Modal, useToast } from '../components/ui'
import DateFilter from '../components/DateFilter'
import { useData } from '../context/DataContext'
import { useFlows } from '../components/Flows'
import { supabase } from '../lib/supabase'
import { rangeFor } from '../lib/dates'
import { exportCSV, exportXLSX } from '../lib/export'
import { inr, fmtDT, fmtDuration, sessionCode, methodName, categoryName } from '../lib/format'

const statusBadge = (s) => s.status === 'active' 
  ? <Badge tone="violet">Running</Badge> 
  : s.payment_status === 'paid' 
    ? <Badge tone="green">Paid</Badge> 
    : <Badge tone="amber">Unpaid</Badge>

export default function History() {
  const { stations } = useData()
  const { openReceipt, openCheckout } = useFlows()
  const toast = useToast()
  const [preset, setPreset] = useState('today')
  const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [station, setStation] = useState(''); const [method, setMethod] = useState('')
  const [text, setText] = useState('')
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let live = true
    setLoading(true)
    const r = rangeFor(preset, from, to)
    let q = supabase.from('gaming_sessions').select('*').gte('check_in', r.from.toISOString()).lte('check_in', r.to.toISOString()).order('check_in', { ascending: false }).limit(3000)
    if (station) q = q.eq('station_id', station)
    if (method) q = q.eq('payment_method', method)
    q.then(({ data, error }) => { if (!live) return; if (error) toast(error.message, 'err'); setRows(data || []); setLoading(false) })
    return () => { live = false }
  }, [preset, from, to, station, method])

  const shown = useMemo(() => {
    const t = text.trim().toLowerCase()
    return t ? rows.filter((s) => `${s.customer_name || ''} ${s.customer_phone || ''} ${sessionCode(s)} ${s.station_name}`.toLowerCase().includes(t)) : rows
  }, [rows, text])

  const flat = shown.map((s) => ({
    'Session ID': sessionCode(s), 'Customer name': s.customer_name || '', Phone: s.customer_phone || '', 'Gaming station': s.station_name,
    'Gaming category': categoryName(s.category), Players: s.players, 'Check-in': fmtDT(s.check_in), 'Check-out': s.check_out ? fmtDT(s.check_out) : '',
    'Duration (min)': s.duration_minutes ?? '', 'Hourly rate': s.hourly_rate, Subtotal: s.subtotal ?? '', Discount: s.discount_amount, 'Total amount': s.final_amount ?? '',
    'Payment method': methodName(s.payment_method) === '—' ? '' : methodName(s.payment_method), 'Payment status': s.payment_status === 'paid' ? 'Paid' : 'Unpaid',
  }))
  const total = shown.filter((s) => s.payment_status === 'paid').reduce((a, s) => a + Number(s.final_amount), 0)

  return (
    <>
      <PageHeader title="Session Archives" sub={`${shown.length} sessions logged · ${inr(total)} recorded`}>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" disabled={!flat.length} onClick={() => exportCSV(flat, 'power-play-sessions')} className="flex-1 sm:flex-initial">
            <Download className="h-3.5 w-3.5" />CSV
          </Button>
          <Button variant="outline" size="sm" disabled={!flat.length} onClick={() => exportXLSX({ Sessions: flat }, 'power-play-sessions')} className="flex-1 sm:flex-initial">
            <FileSpreadsheet className="h-3.5 w-3.5" />Excel
          </Button>
        </div>
      </PageHeader>

      <Card className="mb-4 p-3.5 sm:p-4 space-y-3">
        <DateFilter {...{ preset, setPreset, from, setFrom, to, setTo }} />
        
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input className="pl-9 text-xs sm:text-sm" placeholder="Search name, phone, session ID" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <Select className="text-xs sm:text-sm" value={station} onChange={(e) => setStation(e.target.value)}>
            <option value="">All Stations</option>
            {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select className="text-xs sm:text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">All Payment Methods</option>
            {['cash', 'upi', 'card', 'other'].map((m) => <option key={m} value={m}>{methodName(m)}</option>)}
          </Select>
        </div>
      </Card>

      {/* Responsive Display: Mobile Cards + Desktop Table */}
      <Card className="overflow-hidden">
        {loading ? <Spinner /> : shown.length === 0 ? (
          <Empty icon={HistoryIcon} title="No sessions found">Try adjusting your date range or filters.</Empty>
        ) : (
          <>
            {/* Mobile Card List (< sm screens) */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {shown.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => setDetail(s)} 
                  className="p-3.5 active:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-brand-700">{sessionCode(s)}</span>
                    {statusBadge(s)}
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="font-display font-bold text-slate-900 text-sm truncate">
                      {s.customer_name || 'Walk-in Player'}
                    </p>
                    <span className="font-display font-extrabold text-sm text-slate-900 tnum">
                      {s.final_amount != null ? inr(s.final_amount) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{s.station_name} · {s.duration_minutes != null ? fmtDuration(s.duration_minutes) : 'In Progress'}</span>
                    <span>{fmtDT(s.check_in)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Full Table (>= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    {['Session', 'Player', 'Phone', 'Station', 'Category', 'Players', 'Check-in', 'Check-out', 'Duration', 'Total', 'Method', 'Status'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((s) => (
                    <tr key={s.id} onClick={() => setDetail(s)} className="cursor-pointer hover:bg-brand-50/40 transition">
                      <td className="px-4 py-3 font-semibold text-brand-700 font-mono text-xs">{sessionCode(s)}</td>
                      <td className="px-4 py-3 font-medium">{s.customer_name || <span className="text-slate-400">Walk-in</span>}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.customer_phone || '—'}</td>
                      <td className="px-4 py-3">{s.station_name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{categoryName(s.category)}</td>
                      <td className="px-4 py-3">{s.players}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">{fmtDT(s.check_in)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">{s.check_out ? fmtDT(s.check_out) : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs">{s.duration_minutes != null ? fmtDuration(s.duration_minutes) : '—'}</td>
                      <td className="px-4 py-3 font-bold tnum">{s.final_amount != null ? inr(s.final_amount) : '—'}</td>
                      <td className="px-4 py-3 text-xs">{methodName(s.payment_method)}</td>
                      <td className="px-4 py-3">{statusBadge(s)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Detailed Modal */}
      {detail && (
        <Modal 
          title={`Session Details · ${sessionCode(detail)}`} 
          onClose={() => setDetail(null)}
          footer={
            <div className="flex flex-wrap justify-end gap-2 w-full">
              {detail.status === 'ended' && (
                <Button variant="success" size="sm" onClick={() => { openCheckout(detail); setDetail(null) }}>
                  Collect Payment
                </Button>
              )}
              {detail.status === 'completed' && (
                <Button size="sm" onClick={() => { openReceipt(detail); setDetail(null) }}>
                  <Receipt className="h-4 w-4" />View / Print Receipt
                </Button>
              )}
            </div>
          }
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm">
            {[
              ['Player Handle', detail.customer_name || 'Walk-in Player'], 
              ['Phone Number', detail.customer_phone || '—'], 
              ['Station Unit', detail.station_name], 
              ['Zone & Pricing', `${categoryName(detail.category)} · ${detail.pricing_label}`],
              ['Party Size', detail.players], 
              ['Hourly Rate', `${inr(detail.hourly_rate)}/hr`], 
              ['Check-in Time', fmtDT(detail.check_in)], 
              ['Checkout Time', detail.check_out ? fmtDT(detail.check_out) : 'Still Active'],
              ['Playtime', detail.duration_minutes != null ? fmtDuration(detail.duration_minutes) : 'In Progress'], 
              ['Billing Type', detail.billing_method.replace(/_/g, ' ')], 
              ['Subtotal', detail.subtotal != null ? inr(detail.subtotal) : '—'], 
              ['Discount', inr(detail.discount_amount)],
              ['Total Amount', detail.final_amount != null ? inr(detail.final_amount) : '—'], 
              ['Payment Status', detail.payment_status === 'paid' ? `Paid via ${methodName(detail.payment_method)}` : 'Unpaid'],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-slate-100 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-[11px] font-bold text-slate-400 uppercase">{k}</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
    </>
  )
}
