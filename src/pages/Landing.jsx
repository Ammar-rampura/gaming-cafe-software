import { useState, useEffect, useRef } from 'react'
import { 
  Gamepad2, 
  Car, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Layers, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Monitor, 
  BarChart3, 
  Lock, 
  Award, 
  Coffee, 
  Cpu,
  Flame,
  Sun,
  X,
  Store,
  ChevronDown,
  Globe2,
  Terminal,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Layers3,
  DollarSign
} from 'lucide-react'
import { VORA_LOGO } from '../lib/logoData'
import { useTheme } from '../context/ThemeContext'
import { cx } from '../components/ui'

let globalAudioInstance = null

function playCyberGreetingSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    // 1. Deep Sub Bass Sweep
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(65, now)
    subOsc.frequency.exponentialRampToValueAtTime(140, now + 0.35)
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 1.2)

    subGain.gain.setValueAtTime(0.01, now)
    subGain.gain.linearRampToValueAtTime(0.25, now + 0.1)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    subOsc.connect(subGain)
    subGain.connect(ctx.destination)
    subOsc.start(now)
    subOsc.stop(now + 1.25)

    // 2. Dual Futuristic Harmonics (Chime / Boot Sound)
    const freqs = [523.25, 659.25, 783.99, 1046.50]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.08)

      gain.gain.setValueAtTime(0.001, now + 0.15 + idx * 0.08)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2 + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 + idx * 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + 0.15 + idx * 0.08)
      osc.stop(now + 1.7 + idx * 0.08)
    })
  } catch (e) {
    console.error('Audio synthesizer error:', e)
  }
}

// Audio player for custom ElevenLabs voice greeting - ensures strictly ONE audio plays at any time
function playWelcomeVoiceAudio(onEndedCallback) {
  try {
    if (globalAudioInstance) {
      globalAudioInstance.pause()
      globalAudioInstance.currentTime = 0
    }
    const audio = new Audio('/welcome-vora.mp3')
    audio.volume = 1.0
    globalAudioInstance = audio

    if (onEndedCallback) {
      audio.onended = onEndedCallback
    }

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio autoplay blocked by browser policy:', err)
      })
    }
    return audio
  } catch (err) {
    console.warn('Audio playback error:', err)
    return null
  }
}

export default function LandingPage({ onOpenLogin, onOpenRegister }) {
  const { isGaming, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('stations')
  const [ticker, setTicker] = useState(14)
  const [faqOpen, setFaqOpen] = useState(null)
  
  // Assembling / Building Animation State
  const [isBuilding, setIsBuilding] = useState(true)
  const [buildProgress, setBuildProgress] = useState(0)
  const [buildStep, setBuildStep] = useState('INITIALIZING VORA CORE')
  const hasTriggeredRef = useRef(false)

  // Interactive Simulator Calculator State
  const [calcPlayers, setCalcPlayers] = useState(2)
  const [calcMinutes, setCalcMinutes] = useState(60)
  const [calcRatePerHr, setCalcRatePerHr] = useState(200)

  // 3D Tilt state for hero cockpit
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Trigger greeting sound & audio strictly ONCE
  const startBuildingSequence = () => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true

    playCyberGreetingSound()
    
    // Play voice after slight chime pause
    setTimeout(() => {
      playWelcomeVoiceAudio(() => {
        // When audio ends:
        setBuildProgress(100)
        setBuildStep('VORA OPERATIONS SYSTEM ONLINE')
        setTimeout(() => {
          setIsBuilding(false)
        }, 600)
      })
    }, 250)

    // Gradual assembly progress synchronized across 3.8s
    const steps = [
      { p: 15, msg: 'LINKING TELEMETRY BUS' },
      { p: 35, msg: 'ASSEMBLING HIGH-PRECISION TIMERS' },
      { p: 58, msg: 'MOUNTING LIVE STATION PODS' },
      { p: 78, msg: 'SYNCING DUAL-MODE OPERATIONAL MATRIX' },
      { p: 92, msg: 'ESTABLISHING ZERO-DRIFT SATELLITE' },
      { p: 100, msg: 'SYSTEM READY' }
    ]

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setBuildProgress(prev => Math.max(prev, s.p))
        setBuildStep(s.msg)
      }, 500 + idx * 550)
    })

    // Safety fallback: if audio fails to play or load, complete animation after 4s
    setTimeout(() => {
      setIsBuilding(false)
    }, 4200)
  }

  useEffect(() => {
    // Attempt auto-start
    startBuildingSequence()

    // If blocked by browser autoplay, first user gesture starts it cleanly once
    const handleGesture = () => {
      if (!hasTriggeredRef.current) {
        startBuildingSequence()
      }
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }

    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
      if (globalAudioInstance) {
        globalAudioInstance.pause()
      }
    }
  }, [])

  // Live station ticker cycle
  useEffect(() => {
    const int = setInterval(() => {
      setTicker(prev => (prev >= 28 ? 12 : prev + 1))
    }, 4000)
    return () => clearInterval(int)
  }, [])

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth - 0.5) * 15 // degrees
    const y = (clientY / innerHeight - 0.5) * -15
    setMousePos({ x, y })
  }

  // Calculate simulated billing
  const calcTotal = Math.round((calcMinutes / 60) * calcRatePerHr * calcPlayers)

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] font-sans selection:bg-[var(--crimson)] selection:text-white transition-colors duration-300 overflow-x-hidden relative"
    >
      {/* Construction / Assembly Hologram Overlay while Audio Plays */}
      {isBuilding && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 sm:p-12 bg-[var(--bg-canvas)]/80 backdrop-blur-md transition-opacity duration-700 animate-in fade-in">
          {/* Top HUD */}
          <div className="flex items-center justify-between font-mono text-xs text-[var(--crimson)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--crimson)] animate-ping" />
              <span className="font-bold tracking-widest uppercase">CONSTRUCTING VORA MATRIX</span>
            </div>
            <div className="border border-[var(--crimson)]/30 px-3 py-1 rounded bg-[var(--crimson)]/10 font-bold">
              BUILD: {Math.round(buildProgress)}%
            </div>
          </div>

          {/* Center Hologram Blueprint Grid */}
          <div className="max-w-xl mx-auto w-full text-center py-10 space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-[var(--crimson)]/10 border-2 border-[var(--crimson)] flex items-center justify-center p-4 shadow-2xl shadow-[var(--crimson)]/40 relative">
                <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain filter drop-shadow animate-pulse" />
                <div className="absolute -inset-2 border border-dashed border-[var(--crimson)]/50 rounded-3xl animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            <div className="font-display font-black text-2xl sm:text-3xl tracking-widest text-[var(--ink-primary)]">
              ASSEMBLING VORA OS
            </div>

            <p className="font-mono text-xs tracking-wider text-[var(--crimson)] font-bold animate-pulse">
              &gt; {buildStep} ...
            </p>

            {/* Glowing Construction Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-zinc-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)] mt-4">
              <div 
                className="bg-gradient-to-r from-[var(--crimson)] via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-[var(--crimson)]/50" 
                style={{ width: `${buildProgress}%` }}
              />
            </div>
          </div>

          {/* Bottom HUD Coordinates */}
          <div className="flex items-center justify-between font-mono text-[11px] text-[var(--ink-secondary)]">
            <span>SYNC: ZERO-DRIFT POSIX</span>
            <span>AUDIO STREAM: ELEVENLABS HI-FI</span>
            <button 
              onClick={() => setIsBuilding(false)} 
              className="pointer-events-auto text-[var(--crimson)] underline font-bold hover:text-white"
            >
              Skip Intro &gt;&gt;
            </button>
          </div>
        </div>
      )}

      {/* Voice / Audio Announcement Floating Trigger */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            hasTriggeredRef.current = false
            setIsBuilding(true)
            setBuildProgress(0)
            startBuildingSequence()
          }}
          title="Play voice greeting and assembly animation again"
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[var(--crimson)] text-white text-xs font-bold shadow-lg shadow-[var(--crimson)]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Volume2 className="h-4 w-4 animate-bounce" />
          <span>Play Voice Greeting</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Cyber Grid & Glow Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-[var(--crimson)]/20 via-[var(--crimson)]/5 to-transparent blur-[140px] opacity-75 rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[75%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-500/10 blur-[130px] rounded-full" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
          style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
        />
      </div>

      {/* Top Banner Ticker */}
      <div className="relative z-40 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] text-[11px] font-mono tracking-wider py-1.5 px-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            VORA NETWORK ONLINE
          </span>
          <span className="text-[var(--ink-secondary)] hidden md:inline">|</span>
          <span className="text-[var(--ink-secondary)] hidden md:inline">
            Active Lounges: <strong className="text-[var(--ink-primary)]">{ticker} Centers</strong>
          </span>
          <span className="text-[var(--ink-secondary)] hidden lg:inline">|</span>
          <span className="text-[var(--ink-secondary)] hidden lg:inline">
            Telemetry Drift: <strong className="text-emerald-500">&plusmn;0.00s</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
          >
            {isGaming ? <Sun className="h-3 w-3 text-amber-400" /> : <Flame className="h-3 w-3 text-[var(--crimson)]" />}
            <span className="capitalize">{isGaming ? 'Light Mode' : 'Gaming Mode'}</span>
          </button>
          <span className="text-[var(--ink-secondary)]">v2.4.0 Engine</span>
        </div>
      </div>

      {/* Header / Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg-canvas)]/85 border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--crimson)] to-[#ff4d6d] p-2 flex items-center justify-center shadow-lg shadow-[var(--crimson)]/20 ring-1 ring-white/20">
              <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-wider text-[var(--ink-primary)]">VORA</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--crimson)]/10 text-[var(--crimson)] border border-[var(--crimson)]/20">
                  OS 2.0
                </span>
              </div>
              <p className="text-[10px] text-[var(--ink-secondary)] font-mono uppercase tracking-widest -mt-1 hidden sm:block">
                Gaming Lounge Operations Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ink-secondary)]">
            <a href="#cockpit" className="hover:text-[var(--ink-primary)] transition-colors">Live Cockpit</a>
            <a href="#features" className="hover:text-[var(--ink-primary)] transition-colors">Platform Features</a>
            <a href="#calculator" className="hover:text-[var(--ink-primary)] transition-colors">Revenue Simulator</a>
            <a href="#faq" className="hover:text-[var(--ink-primary)] transition-colors">FAQ</a>
          </nav>

          {/* Action Portals */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRegister}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--ink-primary)] hover:border-[var(--crimson)] transition-all shadow-sm"
            >
              <Store className="h-4 w-4 text-[var(--crimson)]" />
              Register Cafe
            </button>

            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--crimson)] to-[#ff4d6d] text-white text-xs font-bold shadow-lg shadow-[var(--crimson)]/30 hover:shadow-xl hover:shadow-[var(--crimson)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Operator Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Super Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur shadow-sm mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[var(--crimson)] animate-ping" />
              <span className="text-xs font-mono font-bold tracking-wide text-[var(--crimson)] uppercase">
                Welcome to VORA
              </span>
              <span className="text-xs text-[var(--ink-secondary)]">&bull; Next-Gen Station Management</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[var(--ink-primary)]">
              The Command Center for <br className="hidden sm:inline"/>
              <span className="bg-gradient-to-r from-[var(--crimson)] via-[#ff5b79] to-amber-500 bg-clip-text text-transparent">
                Elite Gaming Lounges
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-xl text-[var(--ink-secondary)] max-w-2xl mx-auto leading-relaxed">
              Orchestrate PlayStation 5 pods, precision racing simulator rigs, snacks inventory, and real-time per-second billing with zero drift and verified cafe security.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onOpenLogin}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--crimson)] to-[#ff4d6d] text-white font-bold text-sm shadow-xl shadow-[var(--crimson)]/35 hover:shadow-2xl hover:shadow-[var(--crimson)]/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 group"
              >
                <span>Launch VORA Console</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenRegister}
                className="px-8 py-4 rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--crimson)] text-[var(--ink-primary)] font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
              >
                <Store className="h-5 w-5 text-[var(--crimson)]" />
                <span>Onboard Your Gaming Center</span>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              {[
                { label: 'Clock Drift', val: '0.00s', sub: 'High-Precision Sync' },
                { label: 'Live Telemetry', val: '60 fps', sub: 'Instant Pod State' },
                { label: 'Security', val: 'Isolated', sub: 'Multi-Tenant Auth' },
                { label: 'Architecture', val: 'Dual-Mode', sub: 'Daylight & Gaming' }
              ].map((m, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur">
                  <div className="text-xs text-[var(--ink-secondary)] font-mono">{m.label}</div>
                  <div className="text-lg font-bold text-[var(--crimson)] mt-0.5">{m.val}</div>
                  <div className="text-[10px] text-[var(--ink-secondary)]">{m.sub}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Interactive 3D Perspective Hero Cockpit Preview */}
          <div 
            id="cockpit" 
            className="mt-16 sm:mt-24 max-w-6xl mx-auto perspective-1000"
            style={{ perspective: '1200px' }}
          >
            <div 
              style={{
                transform: `rotateY(${mousePos.x * 0.4}deg) rotateX(${mousePos.y * 0.4}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              
              {/* Cockpit Window Bar */}
              <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-[var(--ink-secondary)] pl-2">
                    vora-telemetry-cluster://active-session-hub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    SIMULATED LIVE REVENUE: ₹14,820
                  </span>
                </div>
              </div>

              {/* Cockpit Interior */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-transparent to-[var(--bg-canvas)]/40">
                
                {/* Station Tabs */}
                <div className="flex items-center gap-3 pb-6 border-b border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveTab('stations')}
                    className={cx(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                      activeTab === 'stations' 
                        ? 'bg-[var(--crimson)] text-white shadow-md shadow-[var(--crimson)]/30' 
                        : 'border border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    )}
                  >
                    <Gamepad2 className="h-4 w-4" />
                    PlayStation 5 Pods (4 Active)
                  </button>

                  <button
                    onClick={() => setActiveTab('simulators')}
                    className={cx(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                      activeTab === 'simulators' 
                        ? 'bg-[var(--crimson)] text-white shadow-md shadow-[var(--crimson)]/30' 
                        : 'border border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    )}
                  >
                    <Car className="h-4 w-4" />
                    Motion Rigs & Simulators (2 Active)
                  </button>
                </div>

                {/* Simulated Pod Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Pod 1 */}
                  <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/80 relative overflow-hidden group hover:border-[var(--crimson)]/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[var(--crimson)]">POD #01</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            IN SESSION
                          </span>
                        </div>
                        <h4 className="font-bold text-base mt-1 text-[var(--ink-primary)]">Tekken 8 Tournament</h4>
                      </div>
                      <Gamepad2 className="h-6 w-6 text-[var(--crimson)] group-hover:rotate-12 transition-transform" />
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <div className="flex justify-between text-xs text-[var(--ink-secondary)] font-mono">
                        <span>Elapsed: <strong className="text-[var(--ink-primary)]">01:42:18</strong></span>
                        <span>Players: <strong className="text-[var(--ink-primary)]">2 Players</strong></span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[var(--crimson)] to-amber-500 h-full w-[72%] animate-pulse" />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[var(--ink-secondary)] uppercase">Live Ticking Bill</span>
                        <div className="text-lg font-mono font-bold text-[var(--ink-primary)]">₹510.00</div>
                      </div>
                      <span className="text-xs text-emerald-500 font-mono font-semibold">Ticking Live</span>
                    </div>
                  </div>

                  {/* Pod 2 */}
                  <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/80 relative overflow-hidden group hover:border-[var(--crimson)]/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[var(--crimson)]">POD #02</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            IN SESSION
                          </span>
                        </div>
                        <h4 className="font-bold text-base mt-1 text-[var(--ink-primary)]">FC 24 Premier Derby</h4>
                      </div>
                      <Gamepad2 className="h-6 w-6 text-[var(--crimson)] group-hover:rotate-12 transition-transform" />
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <div className="flex justify-between text-xs text-[var(--ink-secondary)] font-mono">
                        <span>Elapsed: <strong className="text-[var(--ink-primary)]">00:48:30</strong></span>
                        <span>Players: <strong className="text-[var(--ink-primary)]">4 Players</strong></span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[45%]" />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[var(--ink-secondary)] uppercase">Live Ticking Bill</span>
                        <div className="text-lg font-mono font-bold text-[var(--ink-primary)]">₹480.00</div>
                      </div>
                      <span className="text-xs text-emerald-500 font-mono font-semibold">+ 2 Monster Drinks</span>
                    </div>
                  </div>

                  {/* Rig 1 */}
                  <div className="p-5 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)]/40 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-500">RIG #01</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--ink-secondary)] font-bold">
                          READY TO LAUNCH
                        </span>
                      </div>
                      <h4 className="font-bold text-base mt-1 text-[var(--ink-primary)]">Assetto Corsa Pro Rig</h4>
                      <p className="text-xs text-[var(--ink-secondary)] mt-2">
                        Fanatec direct drive wheel, load-cell triple pedals & 49" ultrawide curved cockpit.
                      </p>
                    </div>

                    <button 
                      onClick={onOpenLogin}
                      className="mt-6 w-full py-2.5 rounded-xl border border-[var(--crimson)]/30 text-[var(--crimson)] font-bold text-xs hover:bg-[var(--crimson)] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <span>Launch In Operator App</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 md:py-32 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[var(--crimson)] uppercase">
              Operational Precision
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--ink-primary)] mt-3">
              Built Specifically for the Realities of Gaming Arenas
            </h2>
            <p className="text-base text-[var(--ink-secondary)] mt-4">
              Eliminate revenue leakage from unmonitored consoles, manual receipt disputes, and unbilled overtime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--crimson)]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[var(--crimson)]/10 text-[var(--crimson)] flex items-center justify-center mb-6 border border-[var(--crimson)]/20">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink-primary)]">Zero-Drift Telemetry</h3>
              <p className="text-sm text-[var(--ink-secondary)] mt-3 leading-relaxed">
                Calculates session duration down to the exact second against persistent timestamp anchors, guaranteeing accuracy even if the browser refreshes or loses connectivity.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Auto Grace-Period Cushioning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-Controller Extra Head Fees
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--crimson)]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6 border border-cyan-500/20">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink-primary)]">Instant Snacks & Bar Add-ons</h3>
              <p className="text-sm text-[var(--ink-secondary)] mt-3 leading-relaxed">
                Add Monster energy drinks, Doritos, and instant noodles to ongoing pod sessions with one tap. Consolidate into a single clear itemized settlement.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> One-Tap Cart Integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Live Inventory Stock Alerts
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--crimson)]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 border border-amber-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink-primary)]">Enterprise Isolation</h3>
              <p className="text-sm text-[var(--ink-secondary)] mt-3 leading-relaxed">
                Super-Admin verified onboarding protects your revenue data. Every lounge gets dedicated station pods, staff rosters, and audit trails.
              </p>
              <ul className="mt-6 space-y-2 text-xs font-medium text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-Tenant Row Level Security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Staff Passwords & Roles
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Revenue Calculator */}
      <section id="calculator" className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--crimson)]/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold tracking-widest text-[var(--crimson)] uppercase">
                Interactive Telemetry Simulator
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] mt-2">
                Simulate Station Billing Dynamics
              </h2>
              <p className="text-sm text-[var(--ink-secondary)] mt-2">
                Test how VORA calculates tiered controller rates and duration billing in real time.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Session Duration</span>
                    <span className="text-[var(--crimson)] font-mono font-bold">{calcMinutes} Minutes</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="240" 
                    step="15"
                    value={calcMinutes}
                    onChange={(e) => setCalcMinutes(Number(e.target.value))}
                    className="w-full accent-[var(--crimson)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--ink-secondary)] font-mono mt-1">
                    <span>15m Quick Match</span>
                    <span>1 Hour</span>
                    <span>4 Hours Marathon</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Active Players / Controllers</span>
                    <span className="text-[var(--crimson)] font-mono font-bold">{calcPlayers} Players</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="1"
                    value={calcPlayers}
                    onChange={(e) => setCalcPlayers(Number(e.target.value))}
                    className="w-full accent-[var(--crimson)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--ink-secondary)] font-mono mt-1">
                    <span>1 Solo</span>
                    <span>2 Versus</span>
                    <span>3 Squad</span>
                    <span>4 Party</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Base Hourly Rate per Head</span>
                    <span className="text-[var(--crimson)] font-mono font-bold">₹{calcRatePerHr}/hr</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="500" 
                    step="50"
                    value={calcRatePerHr}
                    onChange={(e) => setCalcRatePerHr(Number(e.target.value))}
                    className="w-full accent-[var(--crimson)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Result Display Card */}
              <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-center relative overflow-hidden">
                <div className="text-xs font-mono uppercase text-[var(--ink-secondary)] tracking-wider">
                  Computed Session Total
                </div>
                
                <div className="text-5xl font-display font-black text-[var(--crimson)] mt-3">
                  ₹{calcTotal}
                </div>

                <div className="mt-4 text-xs text-[var(--ink-secondary)] font-mono">
                  {calcPlayers} player(s) &times; {(calcMinutes / 60).toFixed(1)} hr(s) &times; ₹{calcRatePerHr}/hr
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-center gap-3">
                  <button
                    onClick={onOpenLogin}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--crimson)] to-[#ff4d6d] text-white font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Open Live Counter
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-[var(--crimson)] uppercase">
              Common Questions
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink-primary)] mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does VORA prevent operator revenue loss?",
                a: "Traditional timers rely on wall clocks or paper receipts. VORA records high-resolution start timestamps in the cloud. If an operator walks away, the meter keeps running with zero drift. Extra controllers and snacks bar items are locked into the session total."
              },
              {
                q: "Can I manage both PS5 pods and racing simulator rigs?",
                a: "Yes! VORA features dedicated modules for PlayStation 5 pods and specialized racing simulator rigs (Fanatec, Logitech, Moza), with custom per-minute pricing models for each zone."
              },
              {
                q: "How does onboarding work for a new lounge?",
                a: "Click 'Register Cafe' in the navigation bar. Fill out your lounge details and city. Our Super-Admin security team verifies your lounge, activates your account, and sends your official login credentials via email."
              },
              {
                q: "Does VORA work smoothly on tablets and mobile phones?",
                a: "VORA is 100% responsive. Staff can carry an iPad or smartphone around the floor, start sessions right at the couch, and order snacks on the fly."
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full p-5 text-left font-bold text-base text-[var(--ink-primary)] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cx("h-5 w-5 text-[var(--ink-secondary)] transition-transform duration-200", faqOpen === i && "rotate-180 text-[var(--crimson)]")} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-sm text-[var(--ink-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--crimson)] p-1.5 flex items-center justify-center">
              <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-black text-lg tracking-wider text-[var(--ink-primary)]">VORA OS</span>
            <span className="text-xs text-[var(--ink-secondary)]">
              &copy; {new Date().getFullYear()} VORA Technologies. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--ink-secondary)]">
            <button onClick={onOpenLogin} className="hover:text-[var(--crimson)] font-semibold transition-colors">
              Staff Portal
            </button>
            <button onClick={onOpenRegister} className="hover:text-[var(--crimson)] font-semibold transition-colors">
              Register Lounge
            </button>
            <a href="#cockpit" className="hover:text-[var(--crimson)] transition-colors">
              Telemetry Status
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
