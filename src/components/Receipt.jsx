import { createPortal } from 'react-dom'
import { Printer, MessageSquare, Send, Smartphone, Share2 } from 'lucide-react'
import { Modal, Button } from './ui'
import { useData } from '../context/DataContext'
import { inr, pad, sessionCode, fmtDT, fmtDuration, methodName, categoryName, playersLabel } from '../lib/format'

function Row({ k, v, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: bold ? 700 : 400, fontSize: bold ? 15 : 12, margin: '2px 0' }}>
      <span>{k}</span><span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  )
}
const Line = () => <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

export function ReceiptBody({ s, settings }) {
  const st = settings || {}
  const snacksList = s.snacks || []
  const snacksTotal = s.snacks_amount || snacksList.reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)

  return (
    <div style={{ width: '72mm', fontFamily: '"Courier New", monospace', fontSize: 12, color: '#000', lineHeight: 1.35 }}>
      <div style={{ textAlign: 'center' }}>
        {st.show_logo_on_receipt && st.logo_url && <img src={st.logo_url} alt="" style={{ maxHeight: 48, margin: '0 auto 4px' }} />}
        <div style={{ fontWeight: 700, fontSize: 15 }}>{st.cafe_name || 'VORA GAMING LOUNGE'}</div>
        {st.address && <div style={{ whiteSpace: 'pre-line' }}>{st.address}</div>}
        {st.phone && <div>Ph: {st.phone}</div>}
      </div>
      <Line />
      <Row k="Receipt No" v={s.receipt_no ? `${st.receipt_prefix || ''}${pad(s.receipt_no, 6)}` : 'UNPAID'} />
      <Row k="Session ID" v={sessionCode(s)} />
      <Row k="Customer" v={s.customer_name || 'Walk-in'} />
      <Row k="Station" v={s.station_name} />
      <Row k="Type" v={categoryName(s.category)} />
      <Row k="Players" v={s.players} />
      <Line />
      <Row k="Check-in" v={fmtDT(s.check_in)} />
      <Row k="Check-out" v={fmtDT(s.check_out)} />
      <Row k="Duration" v={fmtDuration(s.duration_minutes)} />
      <Row k="Gaming Rate" v={`${inr(s.hourly_rate)}/hr`} />
      <Row k="Gaming Subtotal" v={inr(s.subtotal)} />
      {Number(s.discount_amount) > 0 && <Row k="Discount" v={`- ${inr(s.discount_amount)}`} />}
      
      {/* Itemized Snacks on printed slip */}
      {snacksList.length > 0 && (
        <>
          <Line />
          <div style={{ fontWeight: 700, margin: '2px 0' }}>SNACKS & DRINKS:</div>
          {snacksList.map((snk, i) => (
            <Row key={i} k={`${snk.name} x${snk.qty}`} v={inr(snk.price * snk.qty)} />
          ))}
          <Row k="Snacks Total" v={inr(snacksTotal)} />
        </>
      )}

      <Line />
      <Row k="TOTAL" v={inr(s.final_amount)} bold />
      <Row k="Paid by" v={methodName(s.payment_method)} />
      <Line />
      <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{st.receipt_footer}</div>
    </div>
  )
}

export function generateWhatsAppReceiptText(s, settings) {
  const st = settings || {}
  const cafeName = st.cafe_name || 'VORA GAMING LOUNGE'
  const snacksList = s.snacks || []
  const snacksTotal = s.snacks_amount || snacksList.reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)

  let text = `🎮 *${cafeName}* 🎮\n`
  text += `━━━━━━━━━━━━━━━━━━━━\n`
  text += `📄 *Receipt No:* ${s.receipt_no ? `${st.receipt_prefix || ''}${pad(s.receipt_no, 6)}` : sessionCode(s)}\n`
  text += `👤 *Customer:* ${s.customer_name || 'Gamer'}\n`
  text += `🕹️ *Station:* ${s.station_name} (${categoryName(s.category)})\n`
  text += `⏱️ *Playtime:* ${fmtDuration(s.duration_minutes)}\n`
  text += `💰 *Gaming Charge:* ${inr(s.subtotal)}\n`

  if (Number(s.discount_amount) > 0) {
    text += `🏷️ *Discount:* -${inr(s.discount_amount)}\n`
  }

  if (snacksList.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━\n`
    text += `🍿 *Cafe Snacks & Drinks:*\n`
    snacksList.forEach((item) => {
      text += `  • ${item.name} ×${item.qty} (${inr(item.price * item.qty)})\n`
    })
    text += `  *Snacks Total:* ${inr(snacksTotal)}\n`
  }

  text += `━━━━━━━━━━━━━━━━━━━━\n`
  text += `💵 *TOTAL PAID:* *${inr(s.final_amount)}* (${methodName(s.payment_method)})\n\n`
  text += `${st.receipt_footer || 'Thank you for playing! See you next match.'}`

  return text
}

export function ReceiptModal({ session, onClose }) {
  const { settings } = useData()

  const sendWhatsApp = () => {
    const rawPhone = (session.customer_phone || '').replace(/[^0-9]/g, '')
    // Default country code 91 if 10 digits
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
    const msg = encodeURIComponent(generateWhatsAppReceiptText(session, settings))
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`
    window.open(url, '_blank')
  }

  return (
    <>
      <Modal
        title="Payment Receipt & Share"
        onClose={onClose}
        wide
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={sendWhatsApp} 
              className="text-emerald-700 hover:bg-emerald-50 border-emerald-300 font-bold"
              title="Share digital receipt on WhatsApp"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600 fill-emerald-600/20" />
              <span>Send via WhatsApp</span>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => window.print()} className="font-bold shadow-brand-600/30">
                <Printer className="h-4 w-4" /> 
                <span>Print Slip</span>
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ReceiptBody s={session} settings={settings} />
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center text-xs text-slate-500">
            {session.customer_phone ? (
              <p>📱 Customer Phone: <strong className="text-slate-800">{session.customer_phone}</strong>. Click <strong>Send via WhatsApp</strong> to deliver instant digital receipt.</p>
            ) : (
              <p>Tip: Add customer phone number during check-in to auto-open their WhatsApp chat.</p>
            )}
          </div>
        </div>
      </Modal>
      {createPortal(<div id="receipt-print"><ReceiptBody s={session} settings={settings} /></div>, document.body)}
    </>
  )
}
