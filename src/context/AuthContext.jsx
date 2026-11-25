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

  const loadProfile = useCallback(async (uid) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) setTimeout(() => loadProfile(s.user.id), 0)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = {
    session, profile, loading,
    isAdmin: profile?.role === 'admin' && profile?.active,
    signIn: async (username, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: toEmail(username), password })
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong username or password.' : error.message)
    },
    signUp: async (name, username, password) => {
      const { data, error } = await supabase.auth.signUp({ email: toEmail(username), password, options: { data: { full_name: name } } })
      if (error) throw error
      if (!data.session) throw new Error('Account created, but Supabase is asking for email confirmation. Turn off "Confirm email" in Supabase > Authentication > Providers > Email, then sign in.')
    },
    signOut: () => supabase.auth.signOut(),
    refreshProfile: () => session && loadProfile(session.user.id),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
