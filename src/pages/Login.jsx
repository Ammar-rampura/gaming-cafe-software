import { useEffect, useState } from 'react'
import { Play, Zap, Shield, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Button, Field, Input, Card } from '../components/ui'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [first, setFirst] = useState(false)
  const [name, setName] = useState('')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { 
    supabase.rpc('has_users').then(({ data }) => setFirst(data === false)) 
  }, [])

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      if (first) {
        if (pass.length < 8) throw new Error('Use a password with at least 8 characters.')
        await signUp(name, user, pass)
      } else await signIn(user, pass)
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  return (
    <div className="relative grid min-h-screen place-items-center p-4 overflow-hidden bg-slate-50">
      {/* Decorative ambient gaming glow circles */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

      <Card className="relative w-full max-w-sm border-slate-200/90 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        {/* Top gradient accent line */}
        <div className="absolute left-0 top-0 h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500" />

        <div className="mb-6 flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg shadow-brand-600/30">
            <Zap className="h-6 w-6 fill-current text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">POWER PLAY</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              {first ? 'System Initial Setup' : 'Gaming Cafe OS'}
            </p>
          </div>
        </div>

        <p className="mb-6 text-xs text-slate-500 font-medium">
          {first ? 'Create the master administrator profile to initialize the lounge system.' : 'Sign in to access station telemetry and billing controls.'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {first && (
            <Field label="Your Full Name">
              <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Admin Name" />
            </Field>
          )}
          <Field label="Staff ID / Email">
            <Input required value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" autoFocus placeholder="admin or name@cafe.com" />
          </Field>
          <Field label="Password">
            <Input required type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={first ? 'new-password' : 'current-password'} placeholder="••••••••" />
          </Field>
          
          {err && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              {err}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full mt-2 font-bold shadow-brand-600/30" loading={busy}>
            {first ? 'Initialize Admin Profile' : 'Authenticate & Enter'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-4">
          <Shield className="h-3.5 w-3.5 text-brand-500" />
          <span>Local Engine Active · Ready for Cloud Supabase</span>
        </div>
      </Card>
    </div>
  )
}
