import { useState } from 'react'
import { 
  Gamepad2, 
  Store, 
  Shield, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Tv, 
  Car, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Clock,
  Send,
  FileCheck2,
  Sun,
  Flame
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { VORA_LOGO } from '../lib/logoData'

export default function Login() {
  const { signIn, submitCafeRequest } = useAuth()
  const { isGaming, toggleTheme } = useTheme()
  
  // Tabs: 'signin' | 'register_cafe'
  const [mode, setMode] = useState('signin')
  
  // Sign in state
  const [signInUser, setSignInUser] = useState('')
  const [signInPass, setSignInPass] = useState('')
  
  // Register Cafe Request state
  const [cafeName, setCafeName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [stationCount, setStationCount] = useState('5')
  const [simulatorCount, setSimulatorCount] = useState('2')
  const [notes, setNotes] = useState('')
  
  // Submission success state
  const [submitted, setSubmitted] = useState(false)
  const [submittedCafe, setSubmittedCafe] = useState(null)

  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Handle Login submission
  const handleSignIn = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await signIn(signInUser, signInPass)
    } catch (x) {
      setErr(x.message)
    } finally {
      setBusy(false)
    }
  }

  // Handle Cafe Request submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setErr('')
    
    if (!cafeName.trim()) {
      setErr('Please enter your gaming lounge name.')
      return
    }
    if (!ownerName.trim()) {
      setErr('Please enter owner / manager name.')
      return
    }
    if (!regEmail.trim()) {
      setErr('Please enter a valid contact email.')
      return
    }

    setBusy(true)
    try {
      await submitCafeRequest({
        cafeName,
        ownerName,
        email: regEmail,
        phone: regPhone,
        address: regAddress,
        stationCount,
        simulatorCount,
        notes
      })
      setSubmittedCafe({
        cafeName: cafeName.trim(),
        ownerName: ownerName.trim(),
        email: regEmail.trim()
      })
      setSubmitted(true)
    } catch (x) {
      setErr(x.message || 'Could not submit registration request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-canvas)] text-[var(--ink-primary)] overflow-x-hidden selection:bg-[var(--crimson)] selection:text-white transition-colors duration-200">
      
      {/* Floating Theme Switcher Button at top right */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border shadow-lg cursor-pointer ${
            isGaming
              ? 'bg-[#121827] text-amber-400 border-white/10 hover:border-amber-400/50'
              : 'bg-white text-slate-700 border-slate-200 hover:border-[var(--crimson)]'
          }`}
          title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
        >
          {isGaming ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Flame className="h-3.5 w-3.5 text-[var(--crimson)]" />
              <span>Gaming Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic ambient gaming lights & mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 sm:w-[550px] h-96 sm:h-[550px] rounded-full bg-[var(--crimson)]/15 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-[var(--wine)]/20 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-12 gap-0 overflow-hidden rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-2xl backdrop-blur-xl">
        
        {/* Left Column: Brand Hero / Lounge Presentation */}
        <div className="md:col-span-5 relative flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-[#182035]/90 via-[#0e1422] to-[#0a0d16] border-b md:border-b-0 md:border-r border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9184B] via-[#73142D] to-indigo-500" />

          <div>
            {/* VORA Logo & Title */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-950 p-1 shadow-lg shadow-[#D9184B]/30 ring-1 ring-white/15">
                <img src={VORA_LOGO} alt="VORA" className="h-full w-full rounded-xl object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-black tracking-tight text-white">VORA</h1>
                  <span className="rounded-full bg-[#D9184B]/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-[#D9184B] border border-[#D9184B]/30">
                    OS 2.0
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Virtual Operations &amp; Recreation Organizer
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-display">
                The Operating System for Modern Gaming Lounges
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your PS5 stations, motion simulator rigs, snacks bar, and live billing telemetry under one unified cloud-enabled platform.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D9184B]/20 text-[#D9184B]">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Per-Minute Station Telemetry</h4>
                  <p className="text-[10px] text-slate-400">Zero-drift game timing &amp; automatic tier billing</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Dual Mode Architecture</h4>
                  <p className="text-[10px] text-slate-400">Daytime Operations Desk &amp; Neon Gaming OS</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 border border-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Enterprise Verified Lounges</h4>
                  <p className="text-[10px] text-slate-400">Security vetted onboarding &amp; dedicated domain</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5 text-[#D9184B]" /> High Security Engine
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
          </div>
        </div>

        {/* Right Column: Sign In or Register Cafe Request */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mode Switch Tabs (Only if not in submitted screen) */}
          {!submitted && (
            <div className="mb-6 flex rounded-xl bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErr(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white shadow-md shadow-[#D9184B]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5" /> Staff / Admin Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register_cafe'); setErr(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register_cafe'
                    ? 'bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white shadow-md shadow-[#D9184B]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="h-3.5 w-3.5" /> Register Your Gaming Cafe
              </button>
            </div>
          )}

          {/* Error Alert */}
          {err && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{err}</span>
            </div>
          )}

          {/* ===================== MODE 1: SIGN IN ===================== */}
          {!submitted && mode === 'signin' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold font-display text-white">Welcome Back</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with your staff ID or issued administrator credentials.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#D9184B]" /> Username / Staff ID
                  </label>
                  <input
                    required
                    type="text"
                    value={signInUser}
                    onChange={(e) => setSignInUser(e.target.value)}
                    placeholder="e.g. admin or your cafe username"
                    className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B] focus:ring-1 focus:ring-[#D9184B] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#D9184B]" /> Password
                  </label>
                  <input
                    required
                    type="password"
                    value={signInPass}
                    onChange={(e) => setSignInPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B] focus:ring-1 focus:ring-[#D9184B] transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D9184B] to-[#73142D] hover:from-[#f0235b] hover:to-[#8c1836] py-3 text-sm font-bold text-white shadow-lg shadow-[#D9184B]/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    {busy ? 'Authenticating...' : 'Enter Lounge Operations'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-xl bg-white/[0.02] p-3 border border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Want to register your cafe on VORA?</span>
                <button
                  type="button"
                  onClick={() => { setMode('register_cafe'); setErr(''); }}
                  className="font-bold text-[#D9184B] hover:underline cursor-pointer"
                >
                  Apply to Register →
                </button>
              </div>
            </div>
          )}

          {/* ===================== MODE 2: REGISTER CAFE REQUEST ===================== */}
          {!submitted && mode === 'register_cafe' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold font-display text-white">Register Your Gaming Lounge</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submit your cafe details for security verification. Once approved, login credentials will be issued.
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-[#D9184B]" /> Gaming Lounge Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      placeholder="e.g. CyberZone Lounge"
                      className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Owner / Manager Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Alex Drake"
                      className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#D9184B]" /> Official Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@cafe.com"
                      className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> City &amp; Lounge Address
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. Sector 18, Cyber Hub, Mumbai"
                    className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D9184B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/10">
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                      <Tv className="h-3 w-3 text-cyan-400" /> PS5 Stations
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={stationCount}
                      onChange={(e) => setStationCount(e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                      <Car className="h-3 w-3 text-orange-400" /> Racing Rigs
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={simulatorCount}
                      onChange={(e) => setSimulatorCount(e.target.value)}
                      className="w-full rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D9184B] to-[#73142D] py-3 text-sm font-bold text-white shadow-lg shadow-[#D9184B]/20 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    {busy ? 'Submitting Application...' : 'Submit Registration Request'}
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Already have an approved account? <span className="text-[#D9184B] font-bold">Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== MODE 3: SUCCESS / PENDING VERIFICATION SCREEN ===================== */}
          {submitted && (
            <div className="text-center py-6 px-2 animate-in fade-in duration-300">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10">
                <FileCheck2 className="h-8 w-8 stroke-[2.2]" />
              </div>

              <h3 className="text-xl font-bold font-display text-white mb-2">
                Your Request Has Been Submitted!
              </h3>

              <div className="max-w-md mx-auto my-4 rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">Gaming Lounge:</span>
                  <span className="font-bold text-white">{submittedCafe?.cafeName}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-white">{submittedCafe?.ownerName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Notification Email:</span>
                  <span className="font-bold text-cyan-400">{submittedCafe?.email}</span>
                </div>
              </div>

              <div className="max-w-md mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-200/90 leading-relaxed text-left flex items-start gap-2.5 mb-6">
                <Clock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  Our security team is conducting a background check. Once approved, your <strong>Username and Master Password</strong> will be automatically delivered to your registered email address.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setMode('signin')
                  setCafeName('')
                  setOwnerName('')
                  setRegEmail('')
                  setRegPhone('')
                  setRegAddress('')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-6 py-2.5 text-xs font-bold text-white transition cursor-pointer"
              >
                Return to Login Page
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
