import { supabase } from './supabase'
import { calcAmount, calcDiscount } from './billing'

export function cleanError(e) {
  const m = (e && e.message) || 'Something went wrong'
  if (m.includes('one_active_session_per_station')) return 'That station already has a running session.'
  if (m.includes('duplicate key')) return 'That already exists.'
  if (m.includes('foreign key')) return 'This item is used by existing records.'
  if (/fetch|network/i.test(m)) return 'No internet connection. Check your network and try again.'
  return m
}

export async function rpc(name, args = {}) {
  // First attempt calling RPC through Supabase
  try {
    const { data, error } = await supabase.rpc(name, args)
    if (!error) return data

    // If function is not found in schema cache (RPC not migrated or cache stale),
    // execute seamlessly via direct table operations so lounge operations never fail!
    const errMsg = String(error.message || '').toLowerCase()
    if (!errMsg.includes('could not find the function') && !errMsg.includes('schema cache')) {
      throw new Error(cleanError(error))
    }
  } catch (err) {
    const m = String(err.message || '').toLowerCase()
    if (!m.includes('could not find the function') && !m.includes('schema cache')) {
      throw err
    }
  }

  // Robust Direct Table Fallback Execution
  return await executeDirectFallback(name, args)
}

async function executeDirectFallback(name, args) {
  const { data: authData } = await supabase.auth.getSession()
  const currentUid = authData?.session?.user?.id || null

  // 1. Fallback for 'start_session'
  if (name === 'start_session') {
    const { p_station, p_rule, p_name, p_phone, p_disc_type, p_disc_value } = args

    // Fetch station
    const { data: st, error: stErr } = await supabase
      .from('gaming_stations')
      .select('*')
      .eq('id', p_station)
      .single()
    if (stErr || !st) throw new Error('Station not found')
    if (st.status === 'maintenance') throw new Error(`${st.name} is under maintenance`)

    // Check if station already occupied
    const { data: activeSessions } = await supabase
      .from('gaming_sessions')
      .select('id')
      .eq('station_id', st.id)
      .eq('status', 'active')
    if (activeSessions && activeSessions.length > 0) {
      throw new Error(`${st.name} is already occupied`)
    }

    // Fetch pricing rule
    const { data: rule, error: rErr } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('id', p_rule)
      .single()
    if (rErr || !rule) throw new Error('Select a valid pricing category')

    // Fetch settings for billing method
    const { data: settings } = await supabase
      .from('settings')
      .select('billing_method')
      .eq('id', 1)
      .maybeSingle()
    const method = settings?.billing_method || 'per_minute'

    let dt = p_disc_type || null
    let dv = Number(p_disc_value) || 0
    if (!dt || dv <= 0) {
      dt = null
      dv = 0
    }

    // Insert new session record
    const { data: newSession, error: insertErr } = await supabase
      .from('gaming_sessions')
      .insert({
        station_id: st.id,
        station_name: st.name,
        category: st.category,
        players: rule.players,
        pricing_label: rule.label,
        pricing_rule_id: rule.id,
        customer_name: (p_name || '').trim() || null,
        customer_phone: (p_phone || '').trim() || null,
        hourly_rate: rule.hourly_rate,
        billing_method: method,
        discount_type: dt,
        discount_value: dv,
        status: 'active',
        started_by: currentUid
      })
      .select()
      .single()

    if (insertErr) throw new Error(cleanError(insertErr))

    // Mark station as occupied
    await supabase
      .from('gaming_stations')
      .update({ status: 'occupied' })
      .eq('id', st.id)

    return newSession
  }

  // 2. Fallback for 'end_session'
  if (name === 'end_session') {
    const { p_session } = args
    const { data: s, error: sErr } = await supabase
      .from('gaming_sessions')
      .select('*')
      .eq('id', p_session)
      .single()
    if (sErr || !s) throw new Error('Session not found')
    if (s.status !== 'active') throw new Error('This session has already ended')

    const now = new Date()
    const diffMs = now.getTime() - new Date(s.check_in).getTime()
    const mins = Math.max(1, Math.ceil(diffMs / 60000))
    const sub = calcAmount(mins, s.hourly_rate, s.billing_method)
    const d = calcDiscount(sub, s.discount_type, s.discount_value)
    const snacksTotal = (s.snacks || []).reduce(
      (sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 
      0
    )

    const finalAmt = Math.max(0, sub - d) + snacksTotal

    const { data: endedSession, error: updateErr } = await supabase
      .from('gaming_sessions')
      .update({
        check_out: now.toISOString(),
        duration_minutes: mins,
        subtotal: sub,
        discount_amount: d,
        snacks_amount: snacksTotal,
        final_amount: finalAmt,
        status: 'ended',
        ended_by: currentUid
      })
      .eq('id', s.id)
      .select()
      .single()

    if (updateErr) throw new Error(cleanError(updateErr))

    // Free station
    await supabase
      .from('gaming_stations')
      .update({ status: 'available' })
      .eq('id', s.station_id)

    return endedSession
  }

  // 3. Fallback for 'update_session_snacks'
  if (name === 'update_session_snacks') {
    const { p_session, p_snacks } = args
    const { data: s, error: sErr } = await supabase
      .from('gaming_sessions')
      .select('*')
      .eq('id', p_session)
      .single()
    if (sErr || !s) throw new Error('Session not found')

    const snacks = p_snacks || []
    const snacksTotal = snacks.reduce(
      (sum, item) => sum + (Number(item.price) * (Number(item.qty) || 1)), 
      0
    )

    const updates = { snacks }
    if (s.status === 'ended') {
      const sub = Number(s.subtotal) || 0
      const d = Number(s.discount_amount) || 0
      updates.snacks_amount = snacksTotal
      updates.final_amount = Math.max(0, sub - d) + snacksTotal
    }

    const { data: updated, error: uErr } = await supabase
      .from('gaming_sessions')
      .update(updates)
      .eq('id', s.id)
      .select()
      .single()

    if (uErr) throw new Error(cleanError(uErr))
    return updated
  }

  // 4. Fallback for 'complete_payment'
  if (name === 'complete_payment') {
    const { p_session, p_method } = args
    const { data: s, error: sErr } = await supabase
      .from('gaming_sessions')
      .select('*')
      .eq('id', p_session)
      .single()
    if (sErr || !s) throw new Error('Session not found')

    const { data: setRes } = await supabase
      .from('settings')
      .select('next_receipt_no')
      .eq('id', 1)
      .single()
    const rn = Number(setRes?.next_receipt_no || 1)

    // Increment receipt number
    await supabase
      .from('settings')
      .update({ next_receipt_no: rn + 1 })
      .eq('id', 1)

    // Record payment
    await supabase
      .from('payments')
      .insert({
        session_id: s.id,
        amount: s.final_amount,
        method: p_method,
        receipt_no: rn,
        received_by: currentUid
      })

    // Complete session
    const { data: completed, error: cErr } = await supabase
      .from('gaming_sessions')
      .update({
        status: 'completed',
        payment_status: 'paid',
        payment_method: p_method,
        receipt_no: rn
      })
      .eq('id', s.id)
      .select()
      .single()

    if (cErr) throw new Error(cleanError(cErr))
    return completed
  }

  // 5. Fallback for 'set_station_status'
  if (name === 'set_station_status') {
    const { p_station, p_status } = args
    const { data: running } = await supabase
      .from('gaming_sessions')
      .select('id')
      .eq('station_id', p_station)
      .eq('status', 'active')
    if (running && running.length > 0) {
      throw new Error('End the running session first')
    }

    const { data: updated, error: uErr } = await supabase
      .from('gaming_stations')
      .update({ status: p_status })
      .eq('id', p_station)
      .select()
      .single()

    if (uErr) throw new Error(cleanError(uErr))
    return updated
  }

  throw new Error(`RPC function ${name} is not available in the database schema.`)
}

export async function run(query) {
  const { data, error } = await query
  if (error) throw new Error(cleanError(error))
  return data
}
