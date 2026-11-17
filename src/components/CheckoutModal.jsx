import { useState } from 'react'
import { Square, Banknote, Smartphone, CreditCard, MoreHorizontal, CheckCircle2, Coffee, Plus } from 'lucide-react'
import { Modal, Button, useToast, cx } from './ui'
import { useData, useNow } from '../context/DataContext'
import { rpc } from '../lib/api'
import { inr, fmtDT, fmtDuration, fmtClock, categoryName, playersLabel, sessionCode } from '../lib/format'
import { runningBill } from '../lib/billing'

const METHODS = [
  ['cash', 'Cash Desk', Banknote], 
  ['upi', 'Instant UPI / QR', Smartphone], 
  ['card', 'Debit / Credit Card', CreditCard], 
  ['other', 'Other / Split', MoreHorizontal]
]

function Summary({ s, live }) {
  const snacksList = s.snacks || []
  const snacksTotal = live?.snacksTotal ?? s.snacks_amount ?? snacksList.reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)

  const rows = [
    ['Player / Tag', s.customer_name || 'Walk-in Player'],
    ['Station Unit', s.station_name],
    ['Game Zone', `${categoryName(s.category)} · ${s.pricing_label}`],
    ['Party Size', playersLabel(s.players)],
    ['Check-in Time', fmtDT(s.check_in)],
    ['Checkout Time', s.check_out ? fmtDT(s.check_out) : 'In Progress (Active)'],
    ['Total Playtime', live ? fmtDuration(live.minutes) : fmtDuration(s.duration_minutes)],
    ['Gaming Subtotal', inr(live ? live.subtotal : s.subtotal)],
    ['Promo Discount', live?.discount || s.discount_amount ? `- ${inr(live ? live.discount : s.discount_amount)}` : 'None'],
    ['Cafe Snacks & Drinks', snacksTotal > 0 ? `+ ${inr(snacksTotal)}` : 'None'],
  ]

  return (
    <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-sm">
      <div className="divide-y divide-slate-100 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between items-center px-4 py-2">
            <span className="font-semibold text-slate-500">{k}</span>
            <span className="font-bold text-slate-800 text-right">{v}</span>
          </div>
        ))}
      </div>

      {/* Itemized Snacks preview if any */}
      {snacksList.length > 0 && (
        <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-2 text-xs">
          <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">Ordered Snacks:</span>
          <div className="flex flex-wrap gap-1.5">
            {snacksList.map((snk, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {snk.name} ×{snk.qty} ({inr(snk.price * snk.qty)})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-gradient-to-r from-brand-50 to-indigo-50 border-t border-brand-200/60 px-5 py-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-800 block">
            {live ? 'Current Bill' : 'Total Payable Amount'}
          </span>
          <span className="text-xs font-semibold text-slate-500">Playtime + Cafe Snacks Included</span>
        </div>
        <div className="font-display text-2xl font-black text-brand-700 tnum">
          {inr(live ? live.total : s.final_amount)}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutModal({ session, onClose, onPaid }) {
  const { reload } = useData()
  const now = useNow()
  const toast = useToast()
  const [fin, setFin] = useState(session.status === 'ended' ? session : null)
  const [method, setMethod] = useState('upi')
  const [busy, setBusy] = useState(false)

  const endIt = async () => {
    setBusy(true)
    try { 
      const res = await rpc('end_session', { p_session: session.id })
      setFin(res)
      toast('Session stopped. Complete payment below.')
      reload() 
    } catch (e) { 
      toast(e.message, 'err')
      reload() 
    } finally { 
      setBusy(false) 
    }
  }

  const pay = async () => {
    setBusy(true)
    try { 
      const done = await rpc('complete_payment', { p_session: fin.id, p_method: method })
      toast('Payment received! Receipt generated.')
      await reload()
      onClose()
      onPaid(done) 
    } catch (e) { 
      toast(e.message, 'err') 
    } finally { 
      setBusy(false) 
    }
  }

  const live = !fin ? runningBill(session, now) : null

  return (
    <Modal
      title={fin ? 'Collect Payment & Print Receipt' : 'Stop Session & Checkout'}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <Summary s={fin || session} live={live} />

        {!fin ? (
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-bold text-rose-900">End Active Match Now?</p>
                <p className="text-xs text-rose-700/80 mt-0.5">
                  This freezes the live counter and finalizes the payable bill (playtime + snacks).
                </p>
              </div>
              <Button variant="danger" onClick={endIt} loading={busy} className="shrink-0 font-bold">
                <Square className="h-4 w-4 fill-current" />
                <span>Stop Clock</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {METHODS.map(([m, label, Icon]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cx(
                      'flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all duration-150',
                      method === m
                        ? 'border-brand-500 bg-brand-50/80 text-brand-900 shadow-sm ring-2 ring-brand-500/20 font-bold'
                        : 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                    )}
                  >
                    <Icon className={cx('h-5 w-5', method === m ? 'text-brand-600' : 'text-slate-400')} />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button variant="success" size="lg" onClick={pay} loading={busy} className="font-bold shadow-emerald-600/25">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark Paid ({inr(fin.final_amount)})</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
