// Local Storage Database implementation for offline / local-first mode
// When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided in .env,
// this seamlessly defers to the real Supabase client.

import { createClient } from '@supabase/supabase-js'
import { calcAmount, calcDiscount } from './billing'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isRealSupabase = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  !SUPABASE_KEY.includes('YOUR-ANON')
)

// Storage keys
const STORAGE_PREFIX = 'pp_local_'

const defaultSeed = {
  users: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@vora.local',
      password: 'password123',
      full_name: 'Admin',
      role: 'admin',
      active: true,
      created_at: new Date().toISOString()
    }
  ],
  settings: {
    id: 1,
    cafe_name: 'VORA GAMING LOUNGE',
    logo_url: null,
    address: 'Main Gaming Lounge',
    phone: '+91 9876543210',
    receipt_footer: 'Thank you for playing! See you again.',
    receipt_prefix: 'VOR-',
    show_logo_on_receipt: false,
    billing_method: 'per_minute',
    next_receipt_no: 1
  },
  gaming_stations: [
    { id: '10000000-0000-0000-0000-000000000001', name: 'PS5 Station 1', category: 'ps5', status: 'available', active: true, sort_order: 1, created_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000002', name: 'PS5 Station 2', category: 'ps5', status: 'available', active: true, sort_order: 2, created_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000003', name: 'PS5 Station 3', category: 'ps5', status: 'available', active: true, sort_order: 3, created_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Racing Simulator 1', category: 'simulator', status: 'available', active: true, sort_order: 1, created_at: new Date().toISOString() },
    { id: '10000000-0000-0000-0000-000000000005', name: 'Racing Simulator 2', category: 'simulator', status: 'available', active: true, sort_order: 2, created_at: new Date().toISOString() }
  ],
  pricing_rules: [
    { id: '20000000-0000-0000-0000-000000000001', category: 'ps5', station_id: null, label: '1 Player', players: 1, hourly_rate: 100, active: true, created_at: new Date().toISOString() },
    { id: '20000000-0000-0000-0000-000000000002', category: 'ps5', station_id: null, label: '2 Players', players: 2, hourly_rate: 150, active: true, created_at: new Date().toISOString() },
    { id: '20000000-0000-0000-0000-000000000003', category: 'ps5', station_id: null, label: '3 Players', players: 3, hourly_rate: 180, active: true, created_at: new Date().toISOString() },
    { id: '20000000-0000-0000-0000-000000000004', category: 'ps5', station_id: null, label: '4 Players', players: 4, hourly_rate: 200, active: true, created_at: new Date().toISOString() },
    { id: '20000000-0000-0000-0000-000000000005', category: 'simulator', station_id: null, label: 'Simulator', players: 1, hourly_rate: 150, active: true, created_at: new Date().toISOString() }
  ],
  discounts: [
    { id: '30000000-0000-0000-0000-000000000001', name: 'Student 10%', type: 'percent', value: 10, active: true, created_at: new Date().toISOString() },
    { id: '30000000-0000-0000-0000-000000000002', name: 'Member Flat ₹50', type: 'flat', value: 50, active: true, created_at: new Date().toISOString() }
  ],
  snacks: [
    { id: '40000000-0000-0000-0000-000000000001', name: 'Red Bull Energy Drink', price: 125, category: 'Beverage', active: true },
    { id: '40000000-0000-0000-0000-000000000002', name: 'Cold Coffee Frappe', price: 90, category: 'Beverage', active: true },
    { id: '40000000-0000-0000-0000-000000000003', name: 'Doritos Nacho Cheese', price: 50, category: 'Snack', active: true },
    { id: '40000000-0000-0000-0000-000000000004', name: 'Peri Peri French Fries', price: 110, category: 'Food', active: true },
    { id: '40000000-0000-0000-0000-000000000005', name: 'Loaded Cheese Burger', price: 140, category: 'Food', active: true },
    { id: '40000000-0000-0000-0000-000000000006', name: 'Mineral Water (1L)', price: 20, category: 'Beverage', active: true },
    { id: '40000000-0000-0000-0000-000000000007', name: 'Maggi Noodles Masala', price: 60, category: 'Food', active: true }
  ],
  gaming_sessions: [],
  payments: [],
  audit_logs: []
}

function getTable(name) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + name)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(`Error loading table ${name}:`, e)
  }
  // Initialize with seed
  const init = defaultSeed[name] !== undefined ? JSON.parse(JSON.stringify(defaultSeed[name])) : []
  setTable(name, init)
  return init
}

function setTable(name, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('pp_local_change', { detail: { table: name } }))
  } catch (e) {
    console.error(`Error saving table ${name}:`, e)
  }
}

function genUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// Current auth state in local mode
const AUTH_KEY = 'pp_local_auth_session'
let authSubscribers = []

function getStoredAuth() {
  try {
    const item = localStorage.getItem(AUTH_KEY)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

function setStoredAuth(session) {
  if (session) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
  authSubscribers.forEach((cb) => {
    try { cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session) } catch (e) { console.error(e) }
  })
}

// Ensure default admin session exists if no users or no current session
function ensureInitialSession() {
  const users = getTable('users')
  const current = getStoredAuth()
  if (!current && users.length > 0) {
    const admin = users[0]
    const sess = {
      user: { id: admin.id, email: admin.email, user_metadata: { full_name: admin.full_name } }
    }
    setStoredAuth(sess)
  }
}
ensureInitialSession()

class LocalQueryBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
    this.sortFields = []
    this.limitCount = null
    this.isSingle = false
    this.isMaybeSingle = false
    this.action = 'select'
    this.payload = null
  }

  select(fields = '*') {
    this.action = 'select'
    return this
  }

  insert(data) {
    this.action = 'insert'
    this.payload = data
    return this
  }

  update(data) {
    this.action = 'update'
    this.payload = data
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  eq(field, val) {
    this.filters.push((row) => row[field] === val)
    return this
  }

  neq(field, val) {
    this.filters.push((row) => row[field] !== val)
    return this
  }

  gte(field, val) {
    this.filters.push((row) => {
      const v = row[field]
      return v !== null && v !== undefined && new Date(v).getTime() >= new Date(val).getTime()
    })
    return this
  }

  lte(field, val) {
    this.filters.push((row) => {
      const v = row[field]
      return v !== null && v !== undefined && new Date(v).getTime() <= new Date(val).getTime()
    })
    return this
  }

  or(expr) {
    // Basic parser for expressions like `check_in.gte.${ts},check_out.gte.${ts}`
    const parts = expr.split(',')
    this.filters.push((row) => {
      return parts.some((p) => {
        const [field, op, val] = p.split('.')
        if (op === 'gte') {
          const v = row[field]
          return v && new Date(v).getTime() >= new Date(val).getTime()
        }
        if (op === 'eq') return row[field] === val
        return false
      })
    })
    return this
  }

  order(field, { ascending = true } = {}) {
    this.sortFields.push({ field, ascending })
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }

  async execute() {
    let rows = getTable(this.table)

    if (this.action === 'select') {
      if (this.table === 'settings') {
        // settings is a single object or wrapped
        const data = Array.isArray(rows) ? (rows[0] || defaultSeed.settings) : rows
        return { data: this.isSingle || this.isMaybeSingle ? data : [data], error: null }
      }

      let res = Array.isArray(rows) ? [...rows] : [rows]

      for (const f of this.filters) {
        res = res.filter(f)
      }

      for (const { field, ascending } of this.sortFields) {
        res.sort((a, b) => {
          let va = a[field]
          let vb = b[field]
          if (va === null || va === undefined) return 1
          if (vb === null || vb === undefined) return -1
          if (typeof va === 'string' && typeof vb === 'string') {
            return ascending ? va.localeCompare(vb) : vb.localeCompare(va)
          }
          if (typeof va === 'number' && typeof vb === 'number') {
            return ascending ? va - vb : vb - va
          }
          if (new Date(va).toString() !== 'Invalid Date' && new Date(vb).toString() !== 'Invalid Date') {
            return ascending ? new Date(va) - new Date(vb) : new Date(vb) - new Date(va)
          }
          return 0
        })
      }

      if (this.limitCount !== null) {
        res = res.slice(0, this.limitCount)
      }

      if (this.isSingle) {
        return { data: res[0] || null, error: res[0] ? null : { message: 'Row not found' } }
      }
      if (this.isMaybeSingle) {
        return { data: res[0] || null, error: null }
      }

      return { data: res, error: null }
    }

    if (this.action === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload]
      const newItems = items.map((it) => ({
        id: it.id || genUUID(),
        created_at: it.created_at || new Date().toISOString(),
        ...it
      }))
      const current = Array.isArray(rows) ? rows : []
      const updated = [...current, ...newItems]
      setTable(this.table, updated)
      return { data: Array.isArray(this.payload) ? newItems : newItems[0], error: null }
    }

    if (this.action === 'update') {
      if (this.table === 'settings') {
        const current = Array.isArray(rows) ? (rows[0] || defaultSeed.settings) : rows
        const updated = { ...current, ...this.payload }
        setTable(this.table, updated)
        return { data: updated, error: null }
      }

      let updatedList = []
      const current = Array.isArray(rows) ? rows : []
      const next = current.map((row) => {
        let matches = true
        for (const f of this.filters) {
          if (!f(row)) {
            matches = false
            break
          }
        }
        if (matches) {
          const up = { ...row, ...this.payload }
          updatedList.push(up)
          return up
        }
        return row
      })
      setTable(this.table, next)
      return { data: updatedList.length === 1 ? updatedList[0] : updatedList, error: null }
    }

    if (this.action === 'delete') {
      const current = Array.isArray(rows) ? rows : []
      const next = current.filter((row) => {
        for (const f of this.filters) {
          if (!f(row)) return true
        }
        return false
      })
      setTable(this.table, next)
      return { data: null, error: null }
    }

    return { data: null, error: null }
  }
}

// Local mock client
const localSupabase = {
  from(tableName) {
    return new LocalQueryBuilder(tableName)
  },

  async rpc(name, args = {}) {
    const authSess = getStoredAuth()
    const currentUserId = authSess?.user?.id || '00000000-0000-0000-0000-000000000001'

    if (name === 'server_now') {
      return { data: new Date().toISOString(), error: null }
    }

    if (name === 'has_users') {
      const users = getTable('users')
      return { data: users && users.length > 0, error: null }
    }

    if (name === 'log_audit') {
      const logs = getTable('audit_logs')
      const users = getTable('users')
      const u = users.find((x) => x.id === currentUserId)
      const entry = {
        id: logs.length + 1,
        user_id: currentUserId,
        user_name: u?.full_name || 'Staff',
        action: args.p_action,
        entity: args.p_entity,
        entity_id: args.p_id,
        details: args.p_details || null,
        created_at: new Date().toISOString()
      }
      setTable('audit_logs', [entry, ...logs])
      return { data: null, error: null }
    }

    if (name === 'set_station_status') {
      const stations = getTable('gaming_stations')
      const sessions = getTable('gaming_sessions')
      const running = sessions.find((s) => s.station_id === args.p_station && s.status === 'active')
      if (running) {
        return { data: null, error: { message: 'End the running session first' } }
      }
      const updated = stations.map((st) => st.id === args.p_station ? { ...st, status: args.p_status } : st)
      setTable('gaming_stations', updated)
      return { data: null, error: null }
    }

    if (name === 'start_session') {
      const stations = getTable('gaming_stations')
      const rules = getTable('pricing_rules')
      const settings = getTable('settings')
      const sessions = getTable('gaming_sessions')

      const st = stations.find((s) => s.id === args.p_station)
      if (!st) return { data: null, error: { message: 'Station not found' } }
      if (st.status === 'maintenance') return { data: null, error: { message: `${st.name} is under maintenance` } }

      const running = sessions.find((s) => s.station_id === st.id && s.status === 'active')
      if (running) return { data: null, error: { message: `${st.name} is already occupied` } }

      const rule = rules.find((r) => r.id === args.p_rule)
      if (!rule) return { data: null, error: { message: 'Select a valid pricing category' } }

      const newSession = {
        id: genUUID(),
        session_no: sessions.length + 1,
        station_id: st.id,
        station_name: st.name,
        category: st.category,
        players: rule.players,
        pricing_label: rule.label,
        pricing_rule_id: rule.id,
        customer_name: args.p_name ? args.p_name.trim() : null,
        customer_phone: args.p_phone ? args.p_phone.trim() : null,
        check_in: new Date().toISOString(),
        check_out: null,
        hourly_rate: rule.hourly_rate,
        billing_method: settings.billing_method || 'per_minute',
        discount_type: args.p_disc_type || null,
        discount_value: args.p_disc_value || 0,
        discount_amount: 0,
        duration_minutes: null,
        subtotal: null,
        final_amount: null,
        status: 'active',
        payment_status: 'unpaid',
        payment_method: null,
        receipt_no: null,
        started_by: currentUserId,
        created_at: new Date().toISOString()
      }

      setTable('gaming_sessions', [...sessions, newSession])
      setTable('gaming_stations', stations.map((s) => s.id === st.id ? { ...s, status: 'occupied' } : s))
      return { data: newSession, error: null }
    }

    if (name === 'end_session') {
      const sessions = getTable('gaming_sessions')
      const stations = getTable('gaming_stations')
      const s = sessions.find((item) => item.id === args.p_session)
      if (!s) return { data: null, error: { message: 'Session not found' } }
      if (s.status !== 'active') return { data: null, error: { message: 'This session has already ended' } }

      const now = new Date()
      const diffMs = now.getTime() - new Date(s.check_in).getTime()
      const mins = Math.max(1, Math.ceil(diffMs / 60000))
      const sub = calcAmount(mins, s.hourly_rate, s.billing_method)
      const d = calcDiscount(sub, s.discount_type, s.discount_value)
      const snacksTotal = (s.snacks || []).reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)

      const updated = {
        ...s,
        check_out: now.toISOString(),
        duration_minutes: mins,
        subtotal: sub,
        discount_amount: d,
        snacks_amount: snacksTotal,
        final_amount: Math.max(0, sub - d) + snacksTotal,
        status: 'ended',
        ended_by: currentUserId
      }

      setTable('gaming_sessions', sessions.map((item) => item.id === s.id ? updated : item))
      setTable('gaming_stations', stations.map((item) => item.id === s.station_id ? { ...item, status: 'available' } : item))
      return { data: updated, error: null }
    }

    if (name === 'update_session_snacks') {
      const sessions = getTable('gaming_sessions')
      const s = sessions.find((item) => item.id === args.p_session)
      if (!s) return { data: null, error: { message: 'Session not found' } }

      const snacks = args.p_snacks || []
      const snacksTotal = snacks.reduce((sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 0)

      let updated = { ...s, snacks }
      if (s.status === 'ended') {
        const sub = Number(s.subtotal) || 0
        const d = Number(s.discount_amount) || 0
        updated.snacks_amount = snacksTotal
        updated.final_amount = Math.max(0, sub - d) + snacksTotal
      }

      setTable('gaming_sessions', sessions.map((item) => item.id === s.id ? updated : item))
      return { data: updated, error: null }
    }

    if (name === 'complete_payment') {
      const sessions = getTable('gaming_sessions')
      const settings = getTable('settings')
      const payments = getTable('payments')

      const s = sessions.find((item) => item.id === args.p_session)
      if (!s) return { data: null, error: { message: 'Session not found' } }
      if (s.status !== 'ended') return { data: null, error: { message: 'Payment already taken or session still running' } }

      const rn = Number(settings.next_receipt_no || 1)
      setTable('settings', { ...settings, next_receipt_no: rn + 1 })

      const payment = {
        id: genUUID(),
        session_id: s.id,
        amount: s.final_amount,
        method: args.p_method,
        receipt_no: rn,
        received_by: currentUserId,
        paid_at: new Date().toISOString()
      }
      setTable('payments', [...payments, payment])

      const updated = {
        ...s,
        status: 'completed',
        payment_status: 'paid',
        payment_method: args.p_method,
        receipt_no: rn
      }
      setTable('gaming_sessions', sessions.map((item) => item.id === s.id ? updated : item))
      return { data: updated, error: null }
    }

    return { data: null, error: { message: `RPC ${name} not implemented` } }
  },

  channel(name) {
    let listeners = []
    const onStorage = (e) => {
      listeners.forEach((cb) => cb({ eventType: 'UPDATE', schema: 'public', table: e.detail?.table }))
    }
    window.addEventListener('pp_local_change', onStorage)

    const chObj = {
      on(evt, filter, callback) {
        listeners.push(callback)
        return chObj
      },
      subscribe() {
        return chObj
      },
      unsubscribe() {
        window.removeEventListener('pp_local_change', onStorage)
        listeners = []
      }
    }
    return chObj
  },

  removeChannel(ch) {
    if (ch && ch.unsubscribe) ch.unsubscribe()
  },

  auth: {
    async getSession() {
      const session = getStoredAuth()
      return { data: { session }, error: null }
    },

    onAuthStateChange(callback) {
      authSubscribers.push(callback)
      const current = getStoredAuth()
      if (current) {
        setTimeout(() => callback('SIGNED_IN', current), 0)
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authSubscribers = authSubscribers.filter((cb) => cb !== callback)
            }
          }
        }
      }
    },

    async signInWithPassword({ email, password }) {
      const users = getTable('users')
      const normalizedEmail = email.trim().toLowerCase()
      const u = users.find((x) => x.email?.toLowerCase() === normalizedEmail || x.full_name?.toLowerCase() === normalizedEmail)
      if (!u || (u.password && u.password !== password)) {
        return { data: null, error: { message: 'Invalid login credentials' } }
      }
      const session = {
        user: {
          id: u.id,
          email: u.email,
          user_metadata: { full_name: u.full_name }
        }
      }
      setStoredAuth(session)
      return { data: { session, user: session.user }, error: null }
    },

    async signUp({ email, password, options }) {
      const users = getTable('users')
      const normalizedEmail = email.trim().toLowerCase()
      if (users.some((x) => x.email?.toLowerCase() === normalizedEmail)) {
        return { data: null, error: { message: 'User already registered' } }
      }
      const isFirst = users.length === 0
      const newUser = {
        id: genUUID(),
        email: normalizedEmail,
        password: password,
        full_name: (options?.data?.full_name || email.split('@')[0]).trim(),
        role: isFirst ? 'admin' : 'staff',
        active: isFirst ? true : false,
        created_at: new Date().toISOString()
      }
      setTable('users', [...users, newUser])
      const session = {
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: { full_name: newUser.full_name }
        }
      }
      if (newUser.active) {
        setStoredAuth(session)
      }
      return { data: { session: newUser.active ? session : null, user: session.user }, error: null }
    },

    async signOut() {
      setStoredAuth(null)
      return { error: null }
    },

    async updateUser({ password }) {
      const auth = getStoredAuth()
      if (!auth) return { error: { message: 'Not logged in' } }
      const users = getTable('users')
      const next = users.map((u) => u.id === auth.user.id ? { ...u, password } : u)
      setTable('users', next)
      return { data: { user: auth.user }, error: null }
    }
  }
}

export const configured = true
export const supabase = isRealSupabase
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : localSupabase
