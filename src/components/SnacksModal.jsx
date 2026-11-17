import { useState } from 'react'
import { Plus, Minus, Trash2, Coffee, ShoppingBag, Utensils, Check } from 'lucide-react'
import { Modal, Button, useToast, cx } from './ui'
import { useData } from '../context/DataContext'
import { rpc } from '../lib/api'
import { inr } from '../lib/format'

export default function SnacksModal({ session, onClose }) {
  const { snacks, reload } = useData()
  const toast = useToast()
  const [cart, setCart] = useState(session.snacks || [])
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('All')

  const categories = ['All', ...new Set(snacks.map((s) => s.category || 'General'))]

  const getItemQty = (snackId) => {
    const item = cart.find((i) => i.id === snackId)
    return item ? item.qty : 0
  }

  const addSnack = (snack) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === snack.id)
      if (exists) {
        return prev.map((i) => i.id === snack.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { id: snack.id, name: snack.name, price: Number(snack.price), qty: 1 }]
    })
  }

  const removeSnack = (snackId) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === snackId)
      if (!exists) return prev
      if (exists.qty <= 1) {
        return prev.filter((i) => i.id !== snackId)
      }
      return prev.map((i) => i.id === snackId ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const deleteSnack = (snackId) => {
    setCart((prev) => prev.filter((i) => i.id !== snackId))
  }

  const totalSnacksAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const save = async () => {
    setBusy(true)
    try {
      await rpc('update_session_snacks', { p_session: session.id, p_snacks: cart })
      toast('Cafe snacks updated for this session!')
      await reload()
      onClose()
    } catch (e) {
      toast(e.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  const filteredSnacks = activeTab === 'All' 
    ? snacks 
    : snacks.filter((s) => s.category === activeTab)

  return (
    <Modal
      title={`Cafe Snacks & Drinks · ${session.station_name}`}
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Snacks Total</span>
            <span className="font-display text-xl font-black text-brand-700">{inr(totalSnacksAmount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} loading={busy} className="shadow-brand-600/30">
              <Check className="h-4 w-4" />
              <span>Save & Add to Bill</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        {/* Left: Snacks Catalog */}
        <div className="space-y-3">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-1.5 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={cx(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap',
                  activeTab === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredSnacks.map((s) => {
              const qty = getItemQty(s.id)
              return (
                <div
                  key={s.id}
                  className={cx(
                    'flex items-center justify-between p-3 rounded-2xl border transition-all',
                    qty > 0 
                      ? 'border-brand-300 bg-brand-50/40 shadow-sm' 
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-display text-xs font-bold text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs font-black text-brand-700 mt-0.5">{inr(s.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {qty > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => removeSnack(s.id)}
                          className="h-7 w-7 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addSnack(s)}
                          className="h-7 w-7 rounded-lg bg-brand-600 grid place-items-center text-white hover:bg-brand-500 active:scale-95 shadow-sm transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addSnack(s)}
                        className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Active Order Cart */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 flex flex-col h-[380px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-brand-600" />
              <span>Order Basket</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">{cart.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Coffee className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-500">No snacks added</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click + Add on items from the menu</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 shadow-xs">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{inr(item.price)} × {item.qty} = <span className="font-bold text-brand-700">{inr(item.price * item.qty)}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSnack(item.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
