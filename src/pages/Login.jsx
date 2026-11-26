import { useState, useEffect, useRef } from 'react'
import './SeatLogin.css'
import { useAuth } from '../context/AuthContext'
import { 
  Store, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Tv, 
  Car, 
  Send, 
  FileCheck2, 
  Clock, 
  ArrowLeft,
  X
} from 'lucide-react'

export default function Login({ initialMode = 'signin', onBackToLanding }) {
  const { signIn, submitCafeRequest } = useAuth()
  
  // View states: 'seat' (VORA Lounge Seat Login) | 'register_cafe'
  const [viewMode, setViewMode] = useState(initialMode === 'register_cafe' ? 'register_cafe' : 'seat')
  
  // Seat Login internal states
  const [seatView, setSeatView] = useState('login') // 'login' | 'boot' | 'ok'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [bootLines, setBootLines] = useState([])
  const [bootProgress, setBootProgress] = useState(0)
  const [sessionTime, setSessionTime] = useState('SESSION 00:00')
  const [seatNumber] = useState(() => ('0' + (1 + Math.floor(Math.random() * 12))).slice(-2))
  const [currentTime, setCurrentTime] = useState('00:00')
  const [isShaking, setIsShaking] = useState(false)
  const [busy, setBusy] = useState(false)

  // Register Cafe Request state
  const [cafeName, setCafeName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [stationCount, setStationCount] = useState('5')
  const [simulatorCount, setSimulatorCount] = useState('2')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedCafe, setSubmittedCafe] = useState(null)
  const [regErr, setRegErr] = useState('')

  // Refs
  const stageRef = useRef(null)
  const kbRef = useRef(null)
  const activeInputRef = useRef(null)
  const audioCtxRef = useRef(null)
  const keysMapRef = useRef({})
  const timerIntervalRef = useRef(null)

  // 1. Clock update
  useEffect(() => {
    const updateClock = () => {
      const d = new Date()
      setCurrentTime(('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2))
    }
    updateClock()
    const int = setInterval(updateClock, 10000)
    return () => clearInterval(int)
  }, [])

  // 2. Responsive Fit Calculation
  useEffect(() => {
    const fit = () => {
      if (!stageRef.current) return
      const h = stageRef.current.offsetHeight + 40
      const s = Math.min(1, (window.innerHeight - 16) / h, (window.innerWidth - 16) / 470)
      stageRef.current.style.transform = `translate(-50%,-50%) scale(${s})`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [viewMode])

  // 3. Audio Context & Web Audio Tone Generator
  const getAudioCtx = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      return audioCtxRef.current
    } catch {
      return null
    }
  }

  const playTone = (freq, duration, type = 'square', vol = 0.03, delay = 0, targetFreq = null) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    try {
      const t = ctx.currentTime + delay
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t)
      if (targetFreq) {
        osc.frequency.exponentialRampToValueAtTime(targetFreq, t + duration)
      }
      gain.gain.setValueAtTime(vol, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + duration)
    } catch (e) {
      console.warn('Tone error', e)
    }
  }

  // 4. Confetti / Particle Burst on Login Success
  const burstParticles = () => {
    if (!stageRef.current) return
    const cols = ['#D9184B', '#ff7a9d', '#8a3ff0', '#19aaff', '#ffb428', '#fff']
    const cx = 210
    const cy = 200
    for (let i = 0; i < 48; i++) {
      const p = document.createElement('i')
      p.className = 'seat-px'
      p.style.left = cx + 'px'
      p.style.top = cy + 'px'
      p.style.background = cols[i % 6]
      if (i % 3 === 0) p.style.borderRadius = '50%'
      stageRef.current.appendChild(p)
      const a = Math.random() * 6.283
      const v = 90 + Math.random() * 220
      p.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(a) * v * 1.1}px,${Math.sin(a) * v + 90}px) rotate(700deg)`, opacity: 0 }
      ], {
        duration: 1200 + Math.random() * 500,
        easing: 'cubic-bezier(.2,.7,.3,1)'
      }).onfinish = () => p.remove()
    }
  }

  // 5. RGB Keyboard Animation Loop & Key Generation
  useEffect(() => {
    if (viewMode !== 'seat' || !kbRef.current) return

    // Keyboard Layout definition
    const layout = [
      ['1','2','3','4','5','6','7','8','9','0',['⌫','Backspace']],
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l',['⏎','Enter']],
      ['z','x','c','v','b','n','m','.','@','-'],
      ['_',['space',' ',5.2],'#']
    ]

    kbRef.current.innerHTML = ''
    const ks = []
    const byKey = {}

    layout.forEach((row, ri) => {
      const rowDiv = document.createElement('div')
      rowDiv.className = 'seat-row'
      rowDiv.style.padding = ['0','0 13px 0 11px','0 6px','0 22px','0 40px'][ri]

      row.forEach((k, ci) => {
        let lab = k
        let key = k
        let fl = 0
        if (typeof k !== 'string') {
          lab = k[0]
          key = k[1]
          fl = k[2] || 0
        }
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'seat-k' + (fl === 0 && key.length > 1 ? ' seat-w' : '')
        btn.textContent = lab
        if (fl > 1) btn.style.flex = fl + ' 1 0'
        btn.tabIndex = -1
        btn.dataset.k = key
        btn._x = (ci + ri * 0.6) / 11
        btn._y = ri
        btn._h = 0
        rowDiv.appendChild(btn)
        ks.push(btn)
        byKey[key] = btn
      })
      kbRef.current.appendChild(rowDiv)
    })

    keysMapRef.current = byKey

    // RGB Color spectrum cycling
    const colors = [[217,24,75],[255,92,150],[138,63,240],[25,170,255],[255,180,40]]
    const pal = (t) => {
      t = (((t % 1) + 1) % 1) * colors.length
      const i = Math.floor(t)
      const f = t - i
      const a = colors[i]
      const b = colors[(i + 1) % colors.length]
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
    }
    const rgbStr = (c) => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`
    const mixColor = (c, w, k) => [c[0] + (w[0] - c[0]) * k, c[1] + (w[1] - c[1]) * k, c[2] + (w[2] - c[2]) * k]

    let animId
    let tl = performance.now()
    let T = 0
    let fr = 0

    const loop = (now) => {
      animId = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - tl) / 1000)
      tl = now
      T += dt * 0.05 * 20
      fr++
      if (fr % 2) return

      ks.forEach((b) => {
        let c = pal(T * 0.5 + b._x * 0.9 + b._y * 0.08)
        if (b._h > 0) {
          b._h -= dt * 2
          if (b._h <= 0) b.classList.remove('down')
        }
        b.style.setProperty('--c', rgbStr(c))
      })

      const m = pal(T * 0.5 + 0.3)
      document.documentElement.style.setProperty('--lc', rgbStr(m))
    }

    animId = requestAnimationFrame(loop)

    // Key stroke visual feedback
    const hitKey = (b) => {
      b.classList.add('down')
      b._h = 0.16
      playTone(1500 + Math.random() * 300, 0.025, 'square', 0.012)
    }

    const handlePhysicalKeyDown = (e) => {
      getAudioCtx()
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const b = byKey[k]
      if (b) hitKey(b)
    }

    window.addEventListener('keydown', handlePhysicalKeyDown)

    // Virtual keyboard click handler
    const handleKbPointerDown = (e) => {
      const b = e.target.closest('.seat-k')
      if (!b) return
      e.preventDefault()
      getAudioCtx()
      hitKey(b)
      const k = b.dataset.k
      if (k === 'Enter') {
        handleRunLogin()
        return
      }
      if (busy) return

      const target = activeInputRef.current || 'uid'
      if (target === 'uid') {
        if (k === 'Backspace') {
          setUsername(prev => prev.slice(0, -1))
        } else {
          setUsername(prev => prev + (k === 'space' ? ' ' : k))
        }
      } else {
        if (k === 'Backspace') {
          setPassword(prev => prev.slice(0, -1))
        } else {
          setPassword(prev => prev + (k === 'space' ? ' ' : k))
        }
      }
    }

    const kbEl = kbRef.current
    kbEl.addEventListener('pointerdown', handleKbPointerDown)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handlePhysicalKeyDown)
      if (kbEl) kbEl.removeEventListener('pointerdown', handleKbPointerDown)
    }
  }, [viewMode, busy])

  // 6. Shake & Error Trigger
  const triggerFail = (msg) => {
    setErrorMessage(msg)
    setIsShaking(true)
    playTone(150, 0.3, 'sawtooth', 0.05, 0, 80)
    playTone(110, 0.35, 'sawtooth', 0.05, 0.18)
    setTimeout(() => {
      setIsShaking(false)
    }, 450)
    setTimeout(() => {
      setErrorMessage('')
    }, 3500)
  }

  // 7. Core Login / Boot Flow
  const handleRunLogin = async () => {
    if (busy) return
    getAudioCtx()

    const u = username.trim()
    const p = password

    if (!u) {
      triggerFail('PLAYER ID REQUIRED')
      return
    }
    if (!p) {
      triggerFail('PASSCODE REQUIRED')
      return
    }

    setBusy(true)
    setErrorMessage('')
    document.documentElement.style.setProperty('--fs', '0.35s')
    setSeatView('boot')
    setBootProgress(0)
    setBootLines([])
    playTone(200, 0.4, 'sawtooth', 0.035, 0, 900)

    // Execute authentication via existing Supabase auth
    const authPromise = signIn(u, p).then(
      () => ({ ok: true }),
      (err) => ({ ok: false, msg: err.message || 'Wrong ID or passcode' })
    )

    // Progressive boot lines
    const sequence = [
      `> CHECKING SEAT ${seatNumber}`,
      '> LOADING PROFILE',
      '> SYNCING SESSION'
    ]

    for (let i = 0; i < sequence.length; i++) {
      setBootLines(sequence.slice(0, i + 1))
      setBootProgress((i + 1) * 30)
      playTone(600 + i * 140, 0.05, 'square', 0.03)
      await new Promise(r => setTimeout(r, 560))
    }

    const res = await authPromise
    document.documentElement.style.setProperty('--fs', '2.4s')

    if (!res.ok) {
      setBootProgress(0)
      setSeatView('login')
      setBusy(false)
      triggerFail(res.msg.toUpperCase())
      return
    }

    // Success transition
    setBootProgress(100)
    await new Promise(r => setTimeout(r, 300))
    setSeatView('ok')
    burstParticles()
    ;[523, 659, 784, 1047].forEach((f, i) => {
      playTone(f, 0.16, 'square', 0.04, i * 0.09)
    })

    const t0 = Date.now()
    clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000)
      setSessionTime(`SESSION ${('0' + Math.floor(s / 60)).slice(-2)}:${('0' + (s % 60)).slice(-2)}`)
    }, 500)
  }

  // Handle Cafe Request Submission
  const handleSubmitCafe = async (e) => {
    e.preventDefault()
    setRegErr('')
    if (!cafeName.trim()) return setRegErr('Please enter your gaming lounge name.')
    if (!ownerName.trim()) return setRegErr('Please enter owner / manager name.')
    if (!regEmail.trim()) return setRegErr('Please enter a valid contact email.')

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
      setSubmittedCafe({ cafeName, ownerName, email: regEmail })
      setSubmitted(true)
    } catch (x) {
      setRegErr(x.message || 'Could not submit registration request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="seat-login-root">
      
      {/* Top Header Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a1b20] text-[#ffd3df] border border-[var(--cr)]/40 text-xs font-bold font-mono tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[var(--cr)]" />
            <span>WEBSITE</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setViewMode(prev => prev === 'seat' ? 'register_cafe' : 'seat')
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2a1b20] text-[#ffd3df] border border-[var(--cr)]/40 text-xs font-bold font-mono tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Store className="h-3.5 w-3.5 text-[var(--cr)]" />
          <span>{viewMode === 'seat' ? 'REGISTER CAFE' : 'SEAT LOGIN'}</span>
        </button>
      </div>

      {/* ===================== 1. EXACT "VORA LOUNGE - SEAT LOGIN" STAGE ===================== */}
      {viewMode === 'seat' && (
        <div className="seat-stage" id="stage" ref={stageRef}>
          
          {/* Neon Sign */}
          <div className="seat-neon">
            <b>VORA LOUNGE</b>
            <small>SEAT {seatNumber} &middot; OPEN</small>
          </div>

          {/* CRT Monitor */}
          <div className={`seat-mon ${isShaking ? 'shake' : ''}`} id="mon">
            <div className="seat-scr" id="scr" data-v={seatView}>
              
              {/* Monitor Status Bar */}
              <div className="seat-sb">
                <span><i />VORA LOUNGE</span>
                <span>SEAT {seatNumber} &middot; {currentTime}</span>
              </div>

              {/* View 1: Login Form */}
              <form 
                className="seat-view seat-v-login" 
                onSubmit={(e) => { e.preventDefault(); handleRunLogin(); }}
                autoComplete="on"
              >
                <h3>Welcome back, player</h3>
                <p>power on your seat to start</p>

                <div className={`seat-errb ${errorMessage ? 'on' : ''}`}>
                  {errorMessage}
                </div>

                <label className="seat-f">
                  <b>ID</b>
                  <input
                    id="uid"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => { activeInputRef.current = 'uid'; }}
                    autoComplete="username"
                    spellCheck="false"
                    placeholder="player id"
                  />
                </label>

                <label className="seat-f">
                  <b>PW</b>
                  <input
                    id="pw"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => { activeInputRef.current = 'pw'; }}
                    autoComplete="current-password"
                    placeholder="passcode"
                  />
                </label>

                <button className="seat-pwr" id="go" type="submit" disabled={busy}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                    <path d="M12 3v9M6.3 6.8a8 8 0 1011.4 0" />
                  </svg>
                  POWER ON SEAT
                </button>
              </form>

              {/* View 2: Boot Screen */}
              <div className="seat-view seat-v-boot">
                <div className="seat-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M6 3.5l15 8.5-15 8.5z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="seat-pb">
                  <i style={{ width: `${bootProgress}%` }} />
                </div>
                <div 
                  className="seat-lines" 
                  dangerouslySetInnerHTML={{ __html: bootLines.join('<br/>') }}
                />
              </div>

              {/* View 3: Seat Ready Success Screen */}
              <div className="seat-view seat-v-ok">
                <div className="seat-ck">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5"/>
                  </svg>
                </div>
                <h4>SEAT {seatNumber} READY</h4>
                <p>welcome, {username.toLowerCase()}</p>
                <div className="seat-tm">{sessionTime}</div>
              </div>

            </div>
          </div>

          {/* Monitor Neck & Foot */}
          <div className="seat-neck" />
          <div className="seat-foot" />

          {/* PC Tower with Cooling Fans & Power Button */}
          <div className="seat-tower">
            <button 
              className="seat-pbn" 
              type="button" 
              aria-label="Power on seat"
              onClick={handleRunLogin}
            >
              <i />
            </button>
            <div className="seat-win">
              <div className="seat-fan" />
              <div className="seat-fan" />
            </div>
          </div>

          {/* Gaming Desk & Underglow */}
          <div className="seat-desk" />
          <div className="seat-ug" />

          {/* Headset Stand */}
          <svg className="seat-hs" viewBox="0 0 50 46" fill="none">
            <path d="M8 28V22a17 17 0 0134 0v6" stroke="#2d2c33" strokeWidth="5" strokeLinecap="round"/>
            <rect x="3" y="24" width="10" height="16" rx="4" fill="#2d2c33"/>
            <rect x="37" y="24" width="10" height="16" rx="4" fill="#2d2c33"/>
            <circle cx="8" cy="32" r="1.8" fill="var(--lc)"/>
            <circle cx="42" cy="32" r="1.8" fill="var(--lc)"/>
          </svg>

          {/* RGB Mechanical Keyboard & Mouse */}
          <div className="seat-kb" id="kb" ref={kbRef} />
          
          <div 
            className="seat-mouse" 
            role="button" 
            aria-label="Click to power on"
            onClick={(e) => {
              const el = e.currentTarget
              el.classList.add('press')
              setTimeout(() => el.classList.remove('press'), 140)
              playTone(900, 0.03, 'square', 0.02)
              handleRunLogin()
            }}
          />

          {/* Seat Number Plate & Footnote */}
          <div className="seat-plate">SEAT {seatNumber}</div>
          <div className="seat-brand">vora gaming os &middot; lounge login</div>

        </div>
      )}

      {/* ===================== 2. REGISTER CAFE MODAL ===================== */}
      {viewMode === 'register_cafe' && (
        <div className="relative z-30 max-w-xl w-full mx-auto p-6 sm:p-8 bg-[#2a1b20]/95 border border-[var(--cr)]/40 rounded-3xl shadow-2xl backdrop-blur-xl text-[#ffd3df] font-sans my-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--cr)]/20">
            <div className="flex items-center gap-2.5">
              <Store className="h-5 w-5 text-[var(--cr)]" />
              <h2 className="font-display font-black text-xl text-white">Register Gaming Lounge</h2>
            </div>
            <button
              onClick={() => setViewMode('seat')}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#ffd3df] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmitCafe} className="space-y-4">
              {regErr && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono">
                  {regErr}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#ff8fb0] font-bold block mb-1">
                    Lounge Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    placeholder="CyberZone Arena"
                    className="w-full bg-[#181013] border border-[var(--cr)]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--cr)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#ff8fb0] font-bold block mb-1">
                    Owner / Manager *
                  </label>
                  <input
                    required
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Alex Drake"
                    className="w-full bg-[#181013] border border-[var(--cr)]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--cr)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#ff8fb0] font-bold block mb-1">
                    Official Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="owner@cyberzone.com"
                    className="w-full bg-[#181013] border border-[var(--cr)]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--cr)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#ff8fb0] font-bold block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#181013] border border-[var(--cr)]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--cr)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#ff8fb0] font-bold block mb-1">
                  City &amp; Full Address
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Sector 18, Cyber Hub, Mumbai"
                  className="w-full bg-[#181013] border border-[var(--cr)]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--cr)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#181013] border border-[var(--cr)]/20">
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 block mb-1">
                    PS5 Stations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={stationCount}
                    onChange={(e) => setStationCount(e.target.value)}
                    className="w-full bg-[#2a1b20] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-amber-400 block mb-1">
                    Racing Rigs
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={simulatorCount}
                    onChange={(e) => setSimulatorCount(e.target.value)}
                    className="w-full bg-[#2a1b20] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--cr)] to-[#ff4d6d] text-white font-mono font-bold text-xs tracking-widest shadow-lg shadow-[var(--cr)]/30 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'SUBMITTING REQUEST...' : 'SUBMIT REGISTRATION APPLICATION'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-white">Application Received!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Our verification team is reviewing <strong>{submittedCafe?.cafeName}</strong>. Once confirmed, login credentials will be delivered to <strong>{submittedCafe?.email}</strong>.
              </p>
              <button
                onClick={() => { setSubmitted(false); setViewMode('seat'); }}
                className="px-6 py-2 rounded-xl bg-[var(--cr)] text-white text-xs font-mono font-bold tracking-wider"
              >
                RETURN TO SEAT LOGIN
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
