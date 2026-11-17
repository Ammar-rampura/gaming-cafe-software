import { supabase } from './supabase'

export function cleanError(e) {
  const m = (e && e.message) || 'Something went wrong'
  if (m.includes('one_active_session_per_station')) return 'That station already has a running session.'
  if (m.includes('duplicate key')) return 'That already exists.'
  if (m.includes('foreign key')) return 'This item is used by existing records.'
  if (/fetch|network/i.test(m)) return 'No internet connection. Check your network and try again.'
  return m
}

export async function rpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new Error(cleanError(error))
  return data
}

export async function run(query) {
  const { data, error } = await query
  if (error) throw new Error(cleanError(error))
  return data
}
