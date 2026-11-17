import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Store, Gamepad2, IndianRupee, Tag, Users, KeyRound, ScrollText, Plus, Pencil, Trash2, Upload, Utensils, Coffee } from 'lucide-react'
import { PageHeader, Card, Button, Field, Input, Select, Modal, Badge, Empty, Spinner, useToast, cx } from '../components/ui'
import { useData } from '../context/DataContext'
import { useAuth, toEmail } from '../context/AuthContext'
import { supabase, SUPABASE_URL, SUPABASE_KEY } from '../lib/supabase'
import { run, rpc, cleanError } from '../lib/api'
import { BILLING_METHODS } from '../lib/billing'
import { inr, fmtDT, categoryName } from '../lib/format'

const TABS = [
  ['cafe', 'Cafe & Receipt', Store], 
  ['stations', 'Stations', Gamepad2], 
  ['pricing', 'Pricing & Rates', IndianRupee], 
  ['snacks', 'Snacks & Menu', Coffee],
  ['discounts', 'Discounts', Tag], 
  ['staff', 'Staff Accounts', Users], 
  ['security', 'Security', KeyRound], 
  ['audit', 'Audit Log', ScrollText]
]

export default function Settings() {
  const [tab, setTab] = useState('cafe')
  const { loading } = useData()
  if (loading) return <Spinner />
  return (
    <>
      <PageHeader title="Admin Settings & Configurations" sub="Manage cafe details, rates, snacks catalog, and staff." />
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-slate-100 p-1 no-scrollbar">
        {TABS.map(([k, l, Icon]) => (
          <button 
            key={k} 
            onClick={() => setTab(k)} 
            className={cx(
              'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap', 
              tab === k 
                ? 'bg-white text-brand-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4" />{l}
          </button>
        ))}
      </div>
      {tab === 'cafe' && <CafeTab />}
      {tab === 'stations' && <StationsTab />}
      {tab === 'pricing' && <PricingTab />}
      {tab === 'snacks' && <SnacksTab />}
      {tab === 'discounts' && <DiscountsTab />}
      {tab === 'staff' && <StaffTab />}
      {tab === 'security' && <PasswordTab />}
      {tab === 'audit' && <AuditTab />}
    </>
  )
}

const Actions = ({ onEdit, onDelete }) => (
  <div className="flex justify-end gap-1">
    <button onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
    <button onClick={onDelete} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
  </div>
)
const Th = ({ children }) => <th className="whitespace-nowrap px-4 py-3">{children}</th>

// ---------------- Cafe & receipt ----------------
function CafeTab() {
  const { settings, reload } = useData()
  const toast = useToast()
  const [f, setF] = useState(settings)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const { id, next_receipt_no, ...rest } = f
      await run(supabase.from('settings').update(rest).eq('id', 1)); await reload(); toast('Settings saved')
    } catch (e) { toast(e.message, 'err') } finally { setBusy(false) }
  }

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) return toast('Choose an image file.', 'err')
    if (file.size > 1024 * 1024) return toast('Image must be under 1 MB.', 'err')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await run(supabase.from('settings').update({ logo_url: reader.result }).eq('id', 1))
        set('logo_url', reader.result); reload(); toast('Logo updated')
      } catch (err) { toast(err.message, 'err') }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center gap-4">
          {f.logo_url ? <img src={f.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200" /> :
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Store className="h-7 w-7" /></div>}
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-4 w-4" />Upload logo<input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
            </label>
            {f.logo_url && <button type="button" onClick={() => run(supabase.from('settings').update({ logo_url: null }).eq('id', 1)).then(() => { set('logo_url', null); reload() })} className="ml-2 text-xs text-rose-600 hover:underline">Remove</button>}
            <p className="mt-1 text-xs text-slate-400">Square PNG or JPG up to 1 MB.</p>
          </div>
        </div>
        <Field label="Cafe name"><Input required value={f.cafe_name} onChange={(e) => set('cafe_name', e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address"><Input value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="e.g. 2nd Floor, Phoenix Mall" /></Field>
          <Field label="Phone number"><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
        </div>
        <Field label="Receipt footer note"><Input value={f.receipt_footer} onChange={(e) => set('receipt_footer', e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Receipt prefix" hint="e.g. PP- gives PP-000042"><Input value={f.receipt_prefix} onChange={(e) => set('receipt_prefix', e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium pt-7"><input type="checkbox" checked={f.show_logo_on_receipt} onChange={(e) => set('show_logo_on_receipt', e.target.checked)} className="h-4 w-4 accent-brand-600" />Print logo on receipt</label>
        </div>
        <Button type="submit" loading={busy} className="mt-2 shadow-brand-600/30">Save settings</Button>
      </form>
    </Card>
  )
}

// ---------------- Stations ----------------
function StationsTab() {
  const { stations, reload } = useData()
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  const save = async () => {
    const name = edit.name.trim()
    if (!name) return toast('Give the station a name.', 'err')
    try {
      if (edit.id) await run(supabase.from('gaming_stations').update({ name, category: edit.category }).eq('id', edit.id))
      else await run(supabase.from('gaming_stations').insert({ name, category: edit.category, sort_order: stations.length + 1 }))
      setEdit(null); reload()
    } catch (e) { toast(e.message, 'err') }
  }
  const remove = async (st) => {
    if (!confirm(`Delete station “${st.name}”?`)) return
    try {
      const { error } = await supabase.from('gaming_stations').delete().eq('id', st.id)
      if (error) await run(supabase.from('gaming_stations').update({ active: false }).eq('id', st.id))
      reload()
    } catch (e) { toast(e.message, 'err') }
  }
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4"><p className="text-sm text-slate-500">{stations.length} active gaming stations configured.</p><Button onClick={() => setEdit({ name: '', category: 'ps5' })}><Plus className="h-4 w-4" />Add station</Button></div>
      <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><Th>Name</Th><Th>Category</Th><th /></tr></thead>
        <tbody className="divide-y divide-slate-100">{stations.map((s) => (
          <tr key={s.id}><td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3">{categoryName(s.category)}</td><td className="px-4 py-3"><Actions onEdit={() => setEdit({ ...s })} onDelete={() => remove(s)} /></td></tr>))}</tbody></table>
      {edit && <Modal title={edit.id ? 'Edit station' : 'Add station'} onClose={() => setEdit(null)} footer={<Button className="w-full" onClick={save}>Save station</Button>}>
        <div className="space-y-4">
          <Field label="Station name"><Input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. PS5 VIP Lounge" /></Field>
          <Field label="Category"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}><option value="ps5">PlayStation</option><option value="simulator">Racing Simulator</option></Select></Field>
        </div></Modal>}
    </Card>
  )
}

// ---------------- Pricing ----------------
function PricingTab() {
  const { rules, settings, reload } = useData()
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  const setMethod = async (m) => { try { await run(supabase.from('settings').update({ billing_method: m }).eq('id', 1)); reload(); toast('Billing method updated for new sessions') } catch (e) { toast(e.message, 'err') } }
  const save = async () => {
    try {
      const row = { category: edit.category, label: edit.label.trim(), players: Number(edit.players), hourly_rate: Number(edit.hourly_rate), active: edit.active }
      if (!row.label || !(row.hourly_rate >= 0)) return toast('Fill in all fields.', 'err')
      if (edit.id) await run(supabase.from('pricing_rules').update(row).eq('id', edit.id)); else await run(supabase.from('pricing_rules').insert(row))
      setEdit(null); reload()
    } catch (e) { toast(e.message, 'err') }
  }
  const remove = async (r) => {
    if (confirm(`Delete rule “${r.label}”?`)) try { await run(supabase.from('pricing_rules').delete().eq('id', r.id)); reload() } catch (e) { toast(e.message, 'err') }
  }
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-display font-bold text-slate-900">Billing calculation method</h3>
        <p className="mt-1 text-xs text-slate-500">Applies when calculating playtime charges at checkout.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Object.entries(BILLING_METHODS).map(([k, label]) => (
            <label key={k} className={cx('flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition', settings?.billing_method === k ? 'border-brand-500 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300')}>
              <div className="flex items-center gap-2"><input type="radio" name="method" checked={settings?.billing_method === k} onChange={() => setMethod(k)} className="accent-brand-600" /><span className="font-semibold text-slate-800 text-sm">{label}</span></div>
            </label>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4"><p className="text-sm text-slate-500">Hourly rates per category & party size.</p><Button onClick={() => setEdit({ category: 'ps5', label: '', players: 1, hourly_rate: '', active: true })}><Plus className="h-4 w-4" />Add rate</Button></div>
        <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><Th>Category</Th><Th>Label</Th><Th>Players</Th><Th>Hourly rate</Th><Th>Status</Th><th /></tr></thead>
          <tbody className="divide-y divide-slate-100">{rules.map((r) => (
            <tr key={r.id}><td className="px-4 py-3">{categoryName(r.category)}</td><td className="px-4 py-3 font-medium">{r.label}</td><td className="px-4 py-3">{r.players}</td><td className="px-4 py-3 tnum font-semibold">{inr(r.hourly_rate)}</td><td className="px-4 py-3"><Badge tone={r.active ? 'green' : 'slate'}>{r.active ? 'Active' : 'Off'}</Badge></td><td className="px-4 py-3"><Actions onEdit={() => setEdit({ ...r })} onDelete={() => remove(r)} /></td></tr>))}</tbody></table>
        {edit && <Modal title={edit.id ? 'Edit pricing rule' : 'Add pricing rule'} onClose={() => setEdit(null)} footer={<Button className="w-full" onClick={save}>Save rule</Button>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}><option value="ps5">PlayStation</option><option value="simulator">Racing Simulator</option></Select></Field>
            <Field label="Players"><Input type="number" min="1" max="10" value={edit.players} onChange={(e) => setEdit({ ...edit, players: e.target.value })} /></Field>
            <Field label="Label" className="sm:col-span-2"><Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} placeholder="e.g. 2 Players (Split Screen)" /></Field>
            <Field label="Hourly rate (₹)" className="sm:col-span-2"><Input type="number" min="0" value={edit.hourly_rate} onChange={(e) => setEdit({ ...edit, hourly_rate: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} className="h-4 w-4 accent-brand-600" />Active</label>
          </div></Modal>}
      </Card>
    </div>
  )
}

// ---------------- Snacks Menu Manager ----------------
function SnacksTab() {
  const { snacks, reload } = useData()
  const toast = useToast()
  const [edit, setEdit] = useState(null)

  const save = async () => {
    try {
      const name = edit.name?.trim()
      const price = Number(edit.price)
      const category = edit.category?.trim() || 'General'
      if (!name || isNaN(price) || price < 0) return toast('Please enter a valid item name and price.', 'err')

      const row = { name, price, category, active: edit.active ?? true }
      if (edit.id) {
        await run(supabase.from('snacks').update(row).eq('id', edit.id))
      } else {
        await run(supabase.from('snacks').insert(row))
      }
      toast(edit.id ? 'Snack updated' : 'New snack added to menu')
      setEdit(null)
      reload()
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  const remove = async (item) => {
    if (confirm(`Remove “${item.name}” from cafe snacks?`)) {
      try {
        await run(supabase.from('snacks').delete().eq('id', item.id))
        reload()
        toast('Item deleted')
      } catch (e) {
        toast(e.message, 'err')
      }
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
        <div>
          <h3 className="font-display font-bold text-slate-900">Cafe Menu & Snacks Catalog</h3>
          <p className="text-xs text-slate-500">Items available for staff to add to active player sessions.</p>
        </div>
        <Button onClick={() => setEdit({ name: '', price: '', category: 'Beverage', active: true })} className="shadow-brand-600/30">
          <Plus className="h-4 w-4" />Add Menu Item
        </Button>
      </div>

      {!snacks?.length ? (
        <Empty icon={Coffee} title="No snacks or drinks added yet">
          Click "Add Menu Item" to start your cafe menu.
        </Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <Th>Item Name</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Availability</Th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snacks.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {s.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-brand-700 tnum">{inr(s.price)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.active !== false ? 'green' : 'slate'}>
                      {s.active !== false ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Actions onEdit={() => setEdit({ ...s })} onDelete={() => remove(s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edit && (
        <Modal 
          title={edit.id ? 'Edit Menu Item' : 'Add New Snack / Beverage'} 
          onClose={() => setEdit(null)} 
          footer={<Button className="w-full font-bold shadow-brand-600/30" onClick={save}>Save Menu Item</Button>}
        >
          <div className="space-y-4">
            <Field label="Item Name">
              <Input 
                value={edit.name} 
                onChange={(e) => setEdit({ ...edit, name: e.target.value })} 
                placeholder="e.g. Monster Energy Ultra, Loaded Nachos" 
                required 
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                  <option value="Beverage">Beverage / Drink</option>
                  <option value="Snack">Chips / Snack</option>
                  <option value="Food">Hot Food / Meal</option>
                  <option value="Dessert">Dessert / Ice Cream</option>
                  <option value="General">General</option>
                </Select>
              </Field>
              <Field label="Selling Price (₹)">
                <Input 
                  type="number" 
                  min="0" 
                  value={edit.price} 
                  onChange={(e) => setEdit({ ...edit, price: e.target.value })} 
                  placeholder="e.g. 120" 
                  required 
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 pt-1 cursor-pointer">
              <input 
                type="checkbox" 
                checked={edit.active !== false} 
                onChange={(e) => setEdit({ ...edit, active: e.target.checked })} 
                className="h-4 w-4 rounded accent-brand-600" 
              />
              <span>In Stock (visible for staff at stations)</span>
            </label>
          </div>
        </Modal>
      )}
    </Card>
  )
}

// ---------------- Discounts ----------------
function DiscountsTab() {
  const { discounts, reload } = useData()
  const toast = useToast()
  const [edit, setEdit] = useState(null)
  const save = async () => {
    try {
      const v = Number(edit.value)
      if (!edit.name.trim() || !(v > 0)) return toast('Enter a name and a discount value above zero.', 'err')
      if (edit.type === 'percent' && v > 100) return toast('Percent cannot exceed 100.', 'err')
      const row = { name: edit.name.trim(), type: edit.type, value: v, active: edit.active }
      if (edit.id) await run(supabase.from('discounts').update(row).eq('id', edit.id)); else await run(supabase.from('discounts').insert(row))
      setEdit(null); reload()
    } catch (e) { toast(e.message, 'err') }
  }
  const remove = async (d) => { if (confirm(`Delete “${d.name}”?`)) try { await run(supabase.from('discounts').delete().eq('id', d.id)); reload() } catch (e) { toast(e.message, 'err') } }
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4"><p className="text-sm text-slate-500">Quick discounts staff can pick at check-in.</p><Button onClick={() => setEdit({ name: '', type: 'percent', value: '', active: true })}><Plus className="h-4 w-4" />Add discount</Button></div>
      {!discounts.length ? <Empty icon={Tag} title="No discount presets">Staff can still type a custom discount at check-in.</Empty> : (
        <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><Th>Name</Th><Th>Value</Th><Th>Status</Th><th /></tr></thead>
          <tbody className="divide-y divide-slate-100">{discounts.map((d) => (
            <tr key={d.id}><td className="px-4 py-3 font-medium">{d.name}</td><td className="px-4 py-3 tnum">{d.type === 'percent' ? `${d.value}%` : inr(d.value)}</td><td className="px-4 py-3"><Badge tone={d.active ? 'green' : 'slate'}>{d.active ? 'Active' : 'Off'}</Badge></td><td className="px-4 py-3"><Actions onEdit={() => setEdit({ ...d })} onDelete={() => remove(d)} /></td></tr>))}</tbody></table>)}
      {edit && <Modal title={edit.id ? 'Edit discount' : 'Add discount'} onClose={() => setEdit(null)} footer={<Button className="w-full" onClick={save}>Save discount</Button>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Regular customer" /></Field>
          <Field label="Type"><Select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}><option value="percent">Percent (%)</option><option value="flat">Flat amount (₹)</option></Select></Field>
          <Field label="Value"><Input type="number" min="0" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} className="h-4 w-4 accent-brand-600" />Active</label>
        </div></Modal>}
    </Card>
  )
}

// ---------------- Staff ----------------
function StaffTab() {
  const { profile } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState(null)
  const [add, setAdd] = useState(null)
  const [busy, setBusy] = useState(false)
  const load = () => supabase.from('users').select('*').order('created_at').then(({ data }) => setUsers(data || []))
  useEffect(() => { load() }, [])

  const patch = async (u, p) => {
    if (u.id === profile.id) return toast('You cannot change your own role or status.', 'err')
    try { await run(supabase.from('users').update(p).eq('id', u.id)); load() } catch (e) { toast(e.message, 'err') }
  }
  const create = async () => {
    const { name, username, password, role } = add
    if (!name.trim() || !username.trim() || password.length < 8) return toast('Enter name, username and a password of at least 8 characters.', 'err')
    setBusy(true)
    try {
      // separate client so the admin stays signed in
      const tmp = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'pp-staff-create' } })
      const { data, error } = await tmp.auth.signUp({ email: toEmail(username), password, options: { data: { full_name: name.trim() } } })
      if (error) throw error
      if (!data.user) throw new Error('Could not create the account.')
      await run(supabase.from('users').update({ active: true, role, full_name: name.trim() }).eq('id', data.user.id))
      setAdd(null); load(); toast('Staff account created')
    } catch (e) { toast(cleanError(e), 'err') } finally { setBusy(false) }
  }
  if (!users) return <Spinner />
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4"><p className="text-sm text-slate-500">Staff sign in with their username and password.</p><Button onClick={() => setAdd({ name: '', username: '', password: '', role: 'staff' })}><Plus className="h-4 w-4" />Add staff</Button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><Th>Name</Th><Th>Login</Th><Th>Role</Th><Th>Status</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">{users.map((u) => (
          <tr key={u.id}><td className="px-4 py-3 font-medium">{u.full_name || '—'}{u.id === profile.id && <span className="ml-2 text-xs text-slate-400">(you)</span>}</td>
            <td className="px-4 py-3 text-slate-500">{(u.email || '').replace('@powerplay.local', '')}</td>
            <td className="px-4 py-3"><Select className="w-32" value={u.role} disabled={u.id === profile.id} onChange={(e) => patch(u, { role: e.target.value })}><option value="staff">Staff</option><option value="admin">Admin</option></Select></td>
            <td className="px-4 py-3"><Button size="sm" variant={u.active ? 'soft' : 'danger'} disabled={u.id === profile.id} onClick={() => patch(u, { active: !u.active })}>{u.active ? 'Active' : 'Disabled — enable'}</Button></td></tr>))}</tbody></table></div>
      {add && <Modal title="Add staff account" onClose={() => setAdd(null)} footer={<Button className="w-full" loading={busy} onClick={create}>Create account</Button>}>
        <div className="space-y-4">
          <Field label="Full name"><Input value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} /></Field>
          <Field label="Username" hint="Letters and numbers, e.g. rahul. An email address also works."><Input value={add.username} onChange={(e) => setAdd({ ...add, username: e.target.value })} /></Field>
          <Field label="Password" hint="At least 8 characters."><Input type="text" value={add.password} onChange={(e) => setAdd({ ...add, password: e.target.value })} /></Field>
          <Field label="Role"><Select value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value })}><option value="staff">Staff — sessions, history</option><option value="admin">Admin — everything</option></Select></Field>
        </div></Modal>}
    </Card>
  )
}

// ---------------- Password ----------------
function PasswordTab() {
  const { profile } = useAuth()
  const toast = useToast()
  const [p1, setP1] = useState(''); const [p2, setP2] = useState(''); const [busy, setBusy] = useState(false)
  const save = async () => {
    if (p1.length < 8) return toast('Use at least 8 characters.', 'err')
    if (p1 !== p2) return toast('The two passwords do not match.', 'err')
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: p1 }); if (error) throw error
      await rpc('log_audit', { p_action: 'change_password', p_entity: 'users', p_id: profile.id, p_details: null })
      setP1(''); setP2(''); toast('Password changed')
    } catch (e) { toast(cleanError(e), 'err') } finally { setBusy(false) }
  }
  return (
    <Card className="max-w-md space-y-4 p-6">
      <Field label="New password"><Input type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoComplete="new-password" /></Field>
      <Field label="Repeat new password"><Input type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" /></Field>
      <Button loading={busy} onClick={save}>Change password</Button>
    </Card>
  )
}

// ---------------- Audit log ----------------
function AuditTab() {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  useEffect(() => { supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500).then(({ data }) => setRows(data || [])) }, [])
  if (!rows) return <Spinner />
  const t = q.trim().toLowerCase()
  const shown = t ? rows.filter((r) => `${r.user_name} ${r.action} ${r.entity} ${JSON.stringify(r.details)}`.toLowerCase().includes(t)) : rows
  return (
    <Card className="overflow-hidden">
      <div className="p-4"><Input placeholder="Search the last 500 actions" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><Th>When</Th><Th>Who</Th><Th>Action</Th><Th>Item</Th><Th>Details</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">{shown.map((r) => (
          <tr key={r.id} className="align-top"><td className="whitespace-nowrap px-4 py-2.5">{fmtDT(r.created_at)}</td><td className="px-4 py-2.5">{r.user_name || 'System'}</td><td className="px-4 py-2.5"><Badge tone="violet">{r.action.replace(/_/g, ' ')}</Badge></td><td className="px-4 py-2.5 text-slate-500">{r.entity.replace(/_/g, ' ')}</td>
            <td className="max-w-md truncate px-4 py-2.5 font-mono text-xs text-slate-500" title={JSON.stringify(r.details)}>{r.details ? JSON.stringify(r.details.new || r.details) : ''}</td></tr>))}</tbody></table></div>
      {!shown.length && <Empty title="Nothing logged yet" />}
    </Card>
  )
}
