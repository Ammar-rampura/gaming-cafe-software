import { useState } from 'react'
import { Gamepad2, Car, Play, Zap, Users, Tag, Phone, User, Sparkles } from 'lucide-react'
import { Modal, Button, Field, Input, Select, useToast, cx } from './ui'
import { useData } from '../context/DataContext'
import { rpc } from '../lib/api'
import { inr, playersLabel } from '../lib/format'
import { playerOptions, rulesFor } from '../lib/billing'

export default function CheckInModal({ stationId, onClose }) {
  const { stations, rules, discounts, stationStatus, reload } = useData()
  const toast = useToast()
  const free = stations.filter((s) => stationStatus(s) === 'available')
  const [sid, setSid] = useState(free.find((s) => s.id === stationId)?.id || '')
  const [players, setPlayers] = useState(1)
  const [ruleId, setRuleId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dType, setDType] = useState('percent')
  const [dVal, setDVal] = useState('')
  const [busy, setBusy] = useState(false)

  const station = free.find((s) => s.id === sid)
  const opts = station ? playerOptions(rules, station) : []
  const effPlayers = opts.includes(players) ? players : opts[0] || 1
  const ruleList = station ? rulesFor(rules, station, effPlayers) : []
  const rule = ruleList.find((r) => r.id === ruleId) || ruleList[0]

  const pick = (id) => { setSid(id); setRuleId('') }
  const presetChange = (id) => {
    const d = discounts.find((x) => x.id === id)
    if (d) { setDType(d.type); setDVal(String(d.value)) } else setDVal('')
  }

  const start = async () => {
    if (!station) return toast('Please select an available station.', 'err')
    if (!rule) return toast('Pricing rule not found for this setup.', 'err')
    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) return toast('Enter a valid phone number, or leave it empty.', 'err')
    const dv = Number(dVal) || 0
    if (dType === 'percent' && dv > 100) return toast('Discount cannot be more than 100%.', 'err')
    
    setBusy(true)
    try {
      await rpc('start_session', { 
        p_station: sid, 
        p_rule: rule.id, 
        p_name: name, 
        p_phone: phone, 
        p_disc_type: dv > 0 ? dType : null, 
        p_disc_value: dv 
      })
      toast(`Session live on ${station.name}!`)
      await reload()
      onClose()
    } catch (e) {
      toast(e.message, 'err')
      reload()
    } finally { setBusy(false) }
  }

  const groups = [
    ['ps5', 'PlayStation 5 Consoles', Gamepad2], 
    ['simulator', 'Racing Motion Rigs', Car]
  ]

  return (
    <Modal
      title="Deploy New Match Session"
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {station && rule ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Rate:</span>
                <span className="font-display text-lg font-black text-brand-700">{inr(rule.hourly_rate)}</span>
                <span className="text-xs text-slate-400">/hr · {rule.label}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Select a station to continue</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={start} loading={busy} disabled={!station || !rule} className="shadow-brand-600/30">
              <Play className="h-4 w-4 fill-current" />
              <span>Launch Session</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step 1: Station Selector Grid */}
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            1. Select Gaming Rig / Station
          </label>
          {free.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
              No stations are currently free. Please wait for an active session to end.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(([cat, title, Icon]) => {
                const list = free.filter((s) => s.category === cat)
                if (!list.length) return null
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {list.map((st) => {
                        const active = st.id === sid
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => pick(st.id)}
                            className={cx(
                              'group relative flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-150',
                              active
                                ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                                : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                            )}
                          >
                            <span className="font-display text-xs font-extrabold text-slate-800">{st.name}</span>
                            <span className={cx(
                              'h-2 w-2 rounded-full',
                              active ? 'bg-brand-600' : 'bg-emerald-500'
                            )} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Step 2: Player Count & Pricing Rule */}
        {station && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                2. Party Size & Rate Tier
              </label>
              <span className="text-[11px] font-bold text-brand-700 bg-brand-100/60 px-2.5 py-0.5 rounded-full">
                {station.name}
              </span>
            </div>

            {opts.length > 1 && (
              <div>
                <span className="block text-xs font-bold text-slate-600 mb-2">Number of Players:</span>
                <div className="flex flex-wrap gap-2">
                  {opts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlayers(p)}
                      className={cx(
                        'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition-all',
                        effPlayers === p
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{playersLabel(p)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ruleList.length > 1 && (
              <Field label="Specific Pricing Rule">
                <Select value={rule?.id || ''} onChange={(e) => setRuleId(e.target.value)}>
                  {ruleList.map((r) => (
                    <option key={r.id} value={r.id}>{r.label} — {inr(r.hourly_rate)}/hr</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        )}

        {/* Step 3: Customer Details & Discounts */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer Tag / Name" hint="Optional walk-in handle">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Alex or Team Vortex" 
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Phone / Discord Handle" hint="Optional for receipt">
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+91 98765 43210" 
                className="pl-9"
              />
            </div>
          </Field>
        </div>

        {/* Optional Discount Presets */}
        {discounts.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-brand-600" />
                <span>Apply Cafe Promo / Discount</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDVal('')}
                className={cx(
                  'rounded-lg px-2.5 py-1 text-xs font-bold border transition',
                  !dVal ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                No Promo
              </button>
              {discounts.filter((d) => d.active).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => presetChange(d.id)}
                  className={cx(
                    'rounded-lg px-2.5 py-1 text-xs font-bold border transition',
                    Number(dVal) === Number(d.value) && dType === d.type 
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
