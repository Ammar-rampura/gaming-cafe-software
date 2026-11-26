import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

// Staff without an email can log in with a simple username.
export const toEmail = (u) => (u.includes('@') ? u.trim() : `${u.trim().toLowerCase().replace(/\s+/g, '')}@vora.local`)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (uid, userMeta = {}) => {
    let { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
    
    // If no row in public.users yet (e.g. trigger didn't run or table was empty):
    if (!data) {
      // Check if there are any users at all
      const { data: allUsers } = await supabase.from('users').select('id')
      const isFirst = !allUsers || allUsers.length === 0
      
      const newProfile = {
        id: uid,
        full_name: userMeta?.full_name || 'Super Admin',
        email: userMeta?.email || null,
        role: isFirst ? 'superadmin' : 'admin',
        active: true
      }
      
      const { data: inserted } = await supabase.from('users').insert([newProfile]).select().maybeSingle()
      data = inserted || newProfile
    } else if (!data.active) {
      // If there is only 1 user in the system, auto-activate as superadmin
      const { data: allUsers } = await supabase.from('users').select('id')
      if (allUsers && allUsers.length <= 1) {
        await supabase.from('users').update({ role: 'superadmin', active: true }).eq('id', uid)
        data = { ...data, role: 'superadmin', active: true }
      }
    }
    
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id, data.session.user.user_metadata)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) setTimeout(() => loadProfile(s.user.id, s.user.user_metadata), 0)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const isSuperAdmin = profile?.role === 'superadmin' && profile?.active
  const isAdmin = (profile?.role === 'admin' || profile?.role === 'superadmin') && profile?.active

  const value = {
    session, profile, loading,
    isAdmin,
    isSuperAdmin,
    signIn: async (username, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: toEmail(username), password })
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong username or password.' : error.message)
    },
    signUp: async (name, username, password) => {
      const { data, error } = await supabase.auth.signUp({ email: toEmail(username), password, options: { data: { full_name: name } } })
      if (error) throw error
      if (!data.session) throw new Error('Account created, but Supabase is asking for email confirmation. Turn off "Confirm email" in Supabase > Authentication > Providers > Email, then sign in.')
    },
    submitCafeRequest: async ({ cafeName, ownerName, email, phone, address, stationCount, simulatorCount, notes }) => {
      // 1. Always call security definer RPC first so RLS cannot block anonymous submission
      const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_cafe_registration', {
        p_cafe_name: (cafeName || '').trim(),
        p_owner_name: (ownerName || '').trim(),
        p_email: (email || '').trim().toLowerCase(),
        p_phone: (phone || '').trim(),
        p_address: (address || '').trim(),
        p_station_count: parseInt(stationCount) || 5,
        p_simulator_count: parseInt(simulatorCount) || 2,
        p_notes: (notes || '').trim()
      })
      if (!rpcErr) return rpcData

      // 2. Fallback to direct table insertion
      const payload = {
        cafe_name: (cafeName || '').trim(),
        owner_name: (ownerName || '').trim(),
        email: (email || '').trim().toLowerCase(),
        phone: (phone || '').trim(),
        address: (address || '').trim(),
        station_count: parseInt(stationCount) || 5,
        simulator_count: parseInt(simulatorCount) || 2,
        notes: (notes || '').trim()
      }
      const { data, error } = await supabase.from('cafe_registration_requests').insert([payload]).select().maybeSingle()
      if (error) throw (rpcErr || error)
      return data
    },
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => session && loadProfile(session.user.id),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
