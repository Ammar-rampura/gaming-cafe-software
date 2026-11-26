import { useState, useEffect, useRef } from 'react'
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
  Clock, 
  Send, 
  FileCheck2, 
  Sun, 
  Flame,
  Eye,
  EyeOff
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
  const [showPass, setShowPass] = useState(false)
  
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
  const [launching, setLaunching] = useState(false)
  const [liveBilling, setLiveBilling] = useState(48260)

  // Interactive mouse parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  // Live billing counter ticker
  useEffect(() => {
    const t = setInterval(() => {
      setLiveBilling(prev => prev + Math.floor(15 + Math.random() * 65))
    }, 2400)
    return () => clearInterval(t)
  }, [])

  // Canvas telemetry network animation from vora-login.html
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = 260
    const H = 110
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const N = [
      [8, 62, 0], [52, 16, 1], [100, 76, 1], [140, 50, 0],
      [176, 26, 0], [178, 72, 0], [250, 50, 1], [112, 28, 0]
    ].map((n, i) => ({ x: n[0], y: n[1], big: n[2], p: i * 1.3 }))
    const E = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 3]]

    let animId
    let start = Date.now()
    const render = () => {
      const tm = Date.now() - start
      ctx.clearRect(0, 0, W, H)
      const isDark = document.documentElement.classList.contains('gaming-mode')
      const lineCol = isDark ? 'rgba(217, 24, 75, 0.25)' : 'rgba(60, 60, 60, 0.16)'
      const muteCol = isDark ? '#a0969a' : '#8b8486'
      const bgCol = isDark ? '#1a1618' : '#f8f5f0'
      const redCol = '#D9184B'

      const P = N.map(n => ({
        x: n.x + Math.sin(tm / 1700 + n.p) * 3,
        y: n.y + Math.cos(tm / 2100 + n.p) * 4,
        big: n.big
      }))

      ctx.lineWidth = 1
      E.forEach(([from, to], i) => {
        const a = P[from]
        const b = P[to]
        ctx.strokeStyle = lineCol
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()

        // Traveling telemetry packet
        const k = (tm / 2600 + i * 0.17) % 1
        ctx.fillStyle = redCol
        ctx.beginPath()
        ctx.arc(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 1.8, 0, Math.PI * 2)
        ctx.fill()
      })

      P.forEach(q => {
        ctx.beginPath()
        ctx.arc(q.x, q.y, q.big ? 6 : 2.8, 0, Math.PI * 2)
        ctx.fillStyle = q.big ? bgCol : muteCol
        ctx.fill()
        if (q.big) {
          ctx.strokeStyle = redCol
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isGaming])

  // Mouse move handler for luxury dial parallax
  const handleMouseMove = (e) => {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 16
    const y = ((e.clientY / window.innerHeight) - 0.5) * 16
    setMousePos({ x: x.toFixed(1), y: y.toFixed(1) })
  }

  // Handle Login submission
  const handleSignIn = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    setLaunching(true)
    try {
      await signIn(signInUser, signInPass)
    } catch (x) {
      setErr(x.message)
      setLaunching(false)
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
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[var(--bg-canvas)] text-[var(--ink-primary)] overflow-x-hidden selection:bg-[var(--crimson)] selection:text-white transition-colors duration-300"
    >
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border shadow-lg cursor-pointer ${
            isGaming
              ? 'bg-[#18181c] text-amber-400 border-white/10 hover:border-amber-400/50'
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

      {/* Main Luxury Stage Layout */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-8">
        
        {/* Left Column: Brand Hero Presentation & Live Telemetry (vora-login.html inspired) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 max-w-lg mx-auto lg:mx-0">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--crimson)] to-[var(--wine)] p-1.5 flex items-center justify-center shadow-lg shadow-[var(--crimson-glow)]">
              <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-[var(--ink-primary)]">VORA</span>
                <span className="rounded-full bg-[var(--crimson)]/15 px-2 py-0.5 text-[10px] font-black tracking-widest text-[var(--crimson)] border border-[var(--crimson)]/30">
                  OS 2.0
                </span>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--ink-muted)]">
                Virtual Operations &amp; Recreation Organizer
              </p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2.5">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[var(--ink-primary)] leading-[1.15]">
              The Operating System for Modern Gaming
            </h1>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
              Unified lounge operations, station automation &amp; live billing telemetry.
            </p>
          </div>

          {/* Canvas Network Graph */}
          <div className="hidden sm:block pt-1">
            <canvas ref={canvasRef} className="w-[260px] h-[110px] max-w-full opacity-90" />
            <div className="mt-3 flex items-center gap-3 text-xs text-[var(--ink-muted)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--crimson)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--crimson)]"></span>
              </span>
              <div>
                <b className="block font-display text-xl sm:text-2xl font-normal text-[var(--ink-primary)] tracking-tight">
                  ₹ {liveBilling.toLocaleString('en-IN')}
                </b>
                <span className="text-[11px] text-[var(--ink-muted)]">Live network billing telemetry</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
              <Gamepad2 className="h-4 w-4 text-[var(--crimson)] shrink-0" />
              <span className="text-[11px] font-bold text-[var(--ink-primary)]">Station Telemetry</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-sm">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-[var(--ink-primary)]">Verified Security</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[var(--ink-muted)] flex items-center gap-2 pt-2">
            <span>VORA OS 2.0</span>
            <span>•</span>
            <span>HIGH SECURITY ENGINE</span>
            <span>•</span>
            <span>v2.4.8</span>
          </div>
        </div>

        {/* Right Column: The Precision Luxury Radial Dial / Card */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div 
            style={{
              transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
              transition: 'transform 0.25s ease-out'
            }}
            className={`relative w-full max-w-[540px] aspect-auto sm:aspect-square rounded-[36px] p-6 sm:p-10 flex flex-col justify-center items-center shadow-2xl transition-all duration-300 border border-[var(--border-hairline)] bg-[var(--bg-surface)] ${
              launching ? 'ring-2 ring-[var(--crimson)] shadow-[var(--crimson-glow)]' : ''
            }`}
          >
            {/* Top Dial Mode Indicator Pill */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-md flex items-center gap-2 text-[11px] font-bold text-[var(--ink-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--crimson)] animate-pulse" />
              <span>{isGaming ? 'Obsidian Gaming Mode' : 'Light Operations Mode'}</span>
            </div>

            {/* Inner Content Area */}
            <div className="w-full max-w-sm mx-auto space-y-5">
              
              {/* Header inside Dial */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 font-display text-lg font-bold text-[var(--ink-primary)]">
                  <span>VORA</span>
                  <span className="text-[10px] font-mono text-[var(--crimson)] border border-[var(--crimson)]/30 rounded px-1.5 py-0.5">
                    OS 2.0
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-[var(--ink-primary)] font-normal">
                  {submitted ? 'Request Received' : mode === 'signin' ? 'Welcome Back' : 'Register Cafe'}
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  {submitted ? 'Verification underway' : mode === 'signin' ? 'Authenticate with your staff or admin credentials' : 'Submit your lounge details for onboarding'}
                </p>
              </div>

              {/* Mode Toggle Switch (Sign In vs Register) */}
              {!submitted && (
                <div className="flex p-1 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setErr(''); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'signin'
                        ? 'bg-[var(--crimson)] text-white shadow-sm'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" /> Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register_cafe'); setErr(''); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'register_cafe'
                        ? 'bg-[var(--crimson)] text-white shadow-sm'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5" /> Register Cafe
                  </button>
                </div>
              )}

              {/* Error message */}
              {err && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{err}</span>
                </div>
              )}

              {/* MODE 1: SIGN IN FORM */}
              {!submitted && mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Floating-style input fields */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[var(--crimson)]" /> Username / Staff ID
                    </label>
                    <input
                      required
                      type="text"
                      value={signInUser}
                      onChange={(e) => setSignInUser(e.target.value)}
                      placeholder="e.g. admin or cafe username"
                      className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--crimson)] transition"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[var(--crimson)]" /> Password
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showPass ? 'text' : 'password'}
                        value={signInPass}
                        onChange={(e) => setSignInPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3.5 py-2.5 pr-10 text-sm text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--crimson)] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-3 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
                        title={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--wine)] py-3 px-6 text-sm font-bold text-white shadow-lg shadow-[var(--crimson-glow)] hover:opacity-95 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <span>{busy ? 'Authenticating...' : 'Enter Lounge'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setMode('register_cafe'); setErr(''); }}
                      className="text-xs text-[var(--ink-muted)] hover:text-[var(--crimson)] transition cursor-pointer"
                    >
                      Want to onboard your cafe on VORA? <span className="font-bold underline">Apply here</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 2: REGISTER CAFE FORM */}
              {!submitted && mode === 'register_cafe' && (
                <form onSubmit={handleSubmitRequest} className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1">
                        Cafe Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={cafeName}
                        onChange={(e) => setCafeName(e.target.value)}
                        placeholder="e.g. Apex Arena"
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-2 text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--crimson)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1">
                        Owner Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-2 text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--crimson)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="owner@cafe.com"
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-2 text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--crimson)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-2 text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--crimson)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1">
                      City &amp; Address
                    </label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="e.g. Mumbai, MG Road"
                      className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-2 text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--crimson)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1 flex items-center gap-1">
                        <Tv className="h-3 w-3 text-cyan-500" /> PS5 Stations
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={stationCount}
                        onChange={(e) => setStationCount(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs text-[var(--ink-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--ink-muted)] block mb-1 flex items-center gap-1">
                        <Car className="h-3 w-3 text-orange-500" /> Racing Rigs
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={simulatorCount}
                        onChange={(e) => setSimulatorCount(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs text-[var(--ink-primary)]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--wine)] py-2.5 px-6 text-xs font-bold text-white shadow-md shadow-[var(--crimson-glow)] hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span>{busy ? 'Submitting...' : 'Submit Application'}</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[11px] text-[var(--ink-muted)] hover:underline cursor-pointer"
                    >
                      Already approved? Sign in here
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 3: SUBMITTED CONFIRMATION */}
              {submitted && (
                <div className="text-center space-y-4 py-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <FileCheck2 className="h-7 w-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[var(--ink-primary)]">Application Submitted</h3>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                      Our platform team is completing verification. Your username &amp; temporary password will be sent to <strong>{submittedCafe?.email}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setMode('signin')
                    }}
                    className="px-5 py-2 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--ink-primary)] hover:border-[var(--crimson)] transition cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
