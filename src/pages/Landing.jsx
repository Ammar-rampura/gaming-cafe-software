import { useState, useEffect } from 'react'
import { 
  Gamepad2, 
  Car, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Monitor, 
  BarChart3, 
  Lock, 
  Award, 
  Coffee, 
  Cpu,
  Flame,
  Sun,
  Store,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Smartphone,
  ChevronUp
} from 'lucide-react'
import { VORA_LOGO } from '../lib/logoData'
import { useTheme } from '../context/ThemeContext'

export default function LuxuryLanding({ onOpenLogin, onOpenRegister }) {
  const { isGaming, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('stations')
  const [activeFaq, setActiveFaq] = useState(null)

  // Interactive Live Simulator State
  const [simHours, setSimHours] = useState(2)
  const [simStations, setSimStations] = useState(8)
  const [simHourlyRate, setSimHourlyRate] = useState(180)
  const [simSnacksAvg, setSimSnacksAvg] = useState(90)

  // Ticking match duration simulator
  const [matchSeconds, setMatchSeconds] = useState(4820)
  useEffect(() => {
    const t = setInterval(() => setMatchSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTimer = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`
  }

  // Calculations
  const dailyGameRevenue = simStations * simHours * simHourlyRate
  const dailySnacksRevenue = simStations * 1.5 * simSnacksAvg
  const monthlyProjected = Math.round((dailyGameRevenue + dailySnacksRevenue) * 30)

  return (
    <div className={`min-h-screen font-sans selection:bg-[#D9184B] selection:text-white transition-colors duration-500 overflow-x-hidden ${
      isGaming ? 'bg-[#0a0a0d] text-[#f4f4f7]' : 'bg-[#fafafc] text-[#16161a]'
    }`}>

      {/* Minimalist Glass Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors ${
        isGaming ? 'bg-[#0a0a0d]/75 border-white/5' : 'bg-white/70 border-black/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D9184B] to-[#ff4d6d] p-2 flex items-center justify-center shadow-lg shadow-[#D9184B]/20">
              <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight">VORA</span>
                <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#D9184B]/10 text-[#D9184B] border border-[#D9184B]/20 font-bold uppercase">
                  OS 2.0
                </span>
              </div>
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-tight text-neutral-400">
            <a href="#cockpit" className="hover:text-current transition-colors">Operations Suite</a>
            <a href="#features" className="hover:text-current transition-colors">Architecture</a>
            <a href="#simulator" className="hover:text-current transition-colors">Yield Calculator</a>
            <a href="#faq" className="hover:text-current transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                isGaming ? 'border-white/10 text-amber-400 hover:bg-white/5' : 'border-black/5 text-neutral-700 hover:bg-black/5'
              }`}
              title={isGaming ? 'Light mode' : 'Gaming mode'}
            >
              {isGaming ? <Sun className="h-4 w-4" /> : <Flame className="h-4 w-4 text-[#D9184B]" />}
            </button>

            <button
              onClick={onOpenRegister}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                isGaming 
                  ? 'border-white/10 hover:border-white/30 text-white bg-white/5' 
                  : 'border-black/10 hover:border-black/30 text-black bg-black/5'
              }`}
            >
              <Store className="h-3.5 w-3.5 text-[#D9184B]" />
              <span>Register Lounge</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D9184B] hover:bg-[#b0103a] text-white text-xs font-bold shadow-lg shadow-[#D9184B]/25 hover:shadow-[#D9184B]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Operator Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section: Editorial Luxury Aesthetic */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#D9184B]/15 via-[#D9184B]/5 to-transparent blur-[140px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wide opacity-80 uppercase">
              Next-Gen Operating System &bull; Version 2.0
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02]">
            Precision Engineering for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#D9184B] via-[#ff5b79] to-amber-400 bg-clip-text text-transparent">
              Modern Gaming Lounges
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed tracking-tight">
            Orchestrate PlayStation 5 pods, motion simulator rigs, cafe stock, and sub-second live billing in one cohesive cloud ecosystem.
          </p>

          {/* CTA Group */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenLogin}
              className="px-8 py-4 rounded-full bg-[#D9184B] hover:bg-[#b0103a] text-white font-bold text-sm shadow-xl shadow-[#D9184B]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
              <span>Launch Operator Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenRegister}
              className={`px-8 py-4 rounded-full font-bold text-sm border backdrop-blur-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${
                isGaming 
                  ? 'border-white/10 hover:border-white/30 text-white bg-white/[0.03]' 
                  : 'border-black/10 hover:border-black/30 text-black bg-black/[0.03]'
              }`}
            >
              <Store className="h-4 w-4 text-[#D9184B]" />
              <span>Onboard Your Lounge</span>
            </button>
          </div>

          {/* Key Metric Pills */}
          <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-display font-extrabold tracking-tight">0.00s</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase font-mono tracking-wider">Clock Telemetry Drift</div>
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold tracking-tight">100%</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase font-mono tracking-wider">Isolated Multi-Tenant</div>
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold tracking-tight">Instant</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase font-mono tracking-wider">Snacks &amp; Bar Sync</div>
            </div>
            <div>
              <div className="text-3xl font-display font-extrabold tracking-tight">Dual-OS</div>
              <div className="text-xs text-neutral-400 mt-1 uppercase font-mono tracking-wider">Day &amp; Night Modes</div>
            </div>
          </div>

        </div>

      </section>

      {/* High-End Glassmorphic Live Cockpit Mockup */}
      <section id="cockpit" className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          
          <div className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl transition-all ${
            isGaming 
              ? 'bg-[#121217]/90 border-white/10 shadow-black/80' 
              : 'bg-white/90 border-black/10 shadow-slate-200'
          }`}>
            
            {/* Window Topbar */}
            <div className={`px-6 py-4 border-b flex items-center justify-between text-xs font-mono ${
              isGaming ? 'border-white/5 bg-black/30 text-neutral-400' : 'border-black/5 bg-neutral-100 text-neutral-600'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-semibold text-current opacity-70">
                  vora-ops-cluster://node-01.telemetry
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500 font-bold">LIVE TELEMETRY STREAM</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-8 sm:p-12">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setActiveTab('stations')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'stations'
                      ? 'bg-[#D9184B] text-white shadow-lg shadow-[#D9184B]/30'
                      : isGaming 
                        ? 'border border-white/10 text-neutral-400 hover:text-white' 
                        : 'border border-black/10 text-neutral-600 hover:text-black'
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>PlayStation 5 Consoles (4 Active)</span>
                </button>

                <button
                  onClick={() => setActiveTab('simulators')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'simulators'
                      ? 'bg-[#D9184B] text-white shadow-lg shadow-[#D9184B]/30'
                      : isGaming 
                        ? 'border border-white/10 text-neutral-400 hover:text-white' 
                        : 'border border-black/10 text-neutral-600 hover:text-black'
                  }`}
                >
                  <Car className="h-4 w-4" />
                  <span>Motion Rigs &amp; Simulators (2 Active)</span>
                </button>
              </div>

              {/* Station Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Active Station Card 1 */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  isGaming ? 'bg-white/[0.03] border-white/10 hover:border-[#D9184B]/50' : 'bg-neutral-50 border-black/5 hover:border-[#D9184B]/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D9184B]">
                        Pod 01 &bull; PlayStation 5
                      </span>
                      <h4 className="font-bold text-lg mt-0.5">Tekken 8 Tournament</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      IN PLAY
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Elapsed Match Time</span>
                      <span className="font-mono font-bold text-current">{formatTimer(matchSeconds)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#D9184B] to-amber-500 h-full w-[65%] animate-pulse" />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-400 block font-mono">Live Session Total</span>
                      <span className="text-xl font-display font-black">₹420.00</span>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">2 Controllers</span>
                  </div>
                </div>

                {/* Active Station Card 2 */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  isGaming ? 'bg-white/[0.03] border-white/10 hover:border-[#D9184B]/50' : 'bg-neutral-50 border-black/5 hover:border-[#D9184B]/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D9184B]">
                        Pod 02 &bull; PlayStation 5
                      </span>
                      <h4 className="font-bold text-lg mt-0.5">FC 24 Premier Derby</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      IN PLAY
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Elapsed Match Time</span>
                      <span className="font-mono font-bold text-current">00:46:12</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[40%]" />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-400 block font-mono">Live Session Total</span>
                      <span className="text-xl font-display font-black">₹390.00</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-500">+ 2 Monster Drinks</span>
                  </div>
                </div>

                {/* Available Simulator Rig Card */}
                <div className={`p-6 rounded-2xl border border-dashed flex flex-col justify-between transition-all ${
                  isGaming ? 'bg-white/[0.01] border-white/15' : 'bg-white border-black/10'
                }`}>
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                        Rig 01 &bull; Direct Drive Sim
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-white/10 text-neutral-400">
                        STANDBY
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mt-1">Assetto Corsa Racing Cockpit</h4>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Fanatec DD1 force feedback, load-cell pedals &amp; 49-inch ultrawide 240Hz display.
                    </p>
                  </div>

                  <button
                    onClick={onOpenLogin}
                    className="mt-6 w-full py-3 rounded-xl border border-[#D9184B]/30 hover:bg-[#D9184B] hover:text-white text-[#D9184B] text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch in Operator App</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Feature Pillars: Clean Bento-Grid Layout */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D9184B] font-bold">
              Core Architecture
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">
              Designed for the Demands of High-Traffic Lounges
            </h2>
            <p className="text-base text-neutral-400 mt-4 leading-relaxed">
              Every detail engineered to prevent revenue leaks, streamline walk-in seating, and protect lounge margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Bento 1 */}
            <div className={`p-8 rounded-3xl border transition-all ${
              isGaming ? 'bg-[#121217]/70 border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#D9184B]/10 text-[#D9184B] flex items-center justify-center mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display">Zero-Drift Telemetry</h3>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                Calculates session duration down to the exact millisecond against persistent cloud anchors. Page reloads, device switches, or WiFi dropouts never lose a second of billable time.
              </p>
            </div>

            {/* Bento 2 */}
            <div className={`p-8 rounded-3xl border transition-all ${
              isGaming ? 'bg-[#121217]/70 border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display">Snacks &amp; Cafe Add-Ons</h3>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                Add cold brew cans, ramen bowls, and energy drinks directly to ongoing pod accounts. Automatically generates a consolidated, itemized receipt at checkout.
              </p>
            </div>

            {/* Bento 3 */}
            <div className={`p-8 rounded-3xl border transition-all ${
              isGaming ? 'bg-[#121217]/70 border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-display">Super Admin Onboarding</h3>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                Each lounge operates inside an isolated, encrypted domain. Super Admin vetting verifies new cafe registrations and issues credentials securely via automated Gmail dispatch.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Yield & Revenue Calculator */}
      <section id="simulator" className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          
          <div className={`p-8 sm:p-14 rounded-3xl border shadow-2xl relative overflow-hidden backdrop-blur-2xl ${
            isGaming ? 'bg-[#121217]/80 border-white/10' : 'bg-white border-black/10'
          }`}>
            
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D9184B] font-bold">
                Lounge Yield Modeling
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
                Simulate Your Arena Revenue
              </h2>
              <p className="text-sm text-neutral-400 mt-2">
                Adjust station volume, average daily utilization, and cafe upsells to project monthly yield.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-400">Active Stations &amp; Rigs</span>
                    <span className="font-mono font-bold text-[#D9184B]">{simStations} Units</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    step="1"
                    value={simStations}
                    onChange={(e) => setSimStations(Number(e.target.value))}
                    className="w-full accent-[#D9184B] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-400">Daily Utilization per Rig</span>
                    <span className="font-mono font-bold text-[#D9184B]">{simHours} Hours/Day</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                    className="w-full accent-[#D9184B] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-400">Base Hourly Rate</span>
                    <span className="font-mono font-bold text-[#D9184B]">₹{simHourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="20"
                    value={simHourlyRate}
                    onChange={(e) => setSimHourlyRate(Number(e.target.value))}
                    className="w-full accent-[#D9184B] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-400">Average Snacks / Drink Order per Seat</span>
                    <span className="font-mono font-bold text-[#D9184B]">₹{simSnacksAvg}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={simSnacksAvg}
                    onChange={(e) => setSimSnacksAvg(Number(e.target.value))}
                    className="w-full accent-[#D9184B] cursor-pointer"
                  />
                </div>
              </div>

              {/* Display Result Box */}
              <div className={`p-8 rounded-2xl border text-center ${
                isGaming ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/5'
              }`}>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Projected 30-Day Gross Arena Yield
                </span>

                <div className="text-5xl font-display font-black text-[#D9184B] mt-4">
                  ₹{monthlyProjected.toLocaleString('en-IN')}
                </div>

                <div className="mt-4 text-xs font-mono text-neutral-400 space-y-1">
                  <div>Rig Gaming Revenue: ₹{(dailyGameRevenue * 30).toLocaleString('en-IN')}</div>
                  <div>Snacks &amp; Cafe Bar: ₹{(dailySnacksRevenue * 30).toLocaleString('en-IN')}</div>
                </div>

                <button
                  onClick={onOpenRegister}
                  className="mt-8 w-full py-3.5 rounded-full bg-[#D9184B] hover:bg-[#b0103a] text-white text-xs font-bold tracking-wide shadow-lg shadow-[#D9184B]/20 transition-all cursor-pointer"
                >
                  Onboard Your Arena Today &rarr;
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D9184B] font-bold">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Everything You Need to Know About VORA
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What makes VORA different from generic cafe timers?",
                a: "Generic cafe timers use local browser timers that drift or reset when computers reboot. VORA syncs every session second against an encrypted cloud clock. Furthermore, VORA natively integrates per-controller tier billing and instant snacks bar settlements."
              },
              {
                q: "Can I manage multiple racing rigs with custom pedals alongside PS5 consoles?",
                a: "Yes! VORA provides dedicated category lanes for both PlayStation 5 pods and specialized racing simulator rigs, each with their own customizable hourly rates and multi-player fees."
              },
              {
                q: "How does onboarding work for a new lounge?",
                a: "Click 'Register Lounge' at the top of the page. Once submitted, our Super Admin team conducts security verification and delivers your administrator credentials via email."
              },
              {
                q: "Can staff run the software on tablets or mobile phones?",
                a: "Yes. VORA is completely responsive and fluid. Staff can walk the lounge floor with an iPad, launch sessions directly at the couch, and append cafe orders on the fly."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isGaming ? 'bg-[#121217]/50 border-white/5' : 'bg-white border-black/5 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-base flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-[#D9184B]' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Minimalist Luxury Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D9184B] p-1.5 flex items-center justify-center">
              <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-black text-base text-current">VORA OS</span>
            <span>&copy; {new Date().getFullYear()} VORA Technologies Inc.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenLogin} className="hover:text-current font-medium transition-colors">
              Staff Sign In
            </button>
            <button onClick={onOpenRegister} className="hover:text-current font-medium transition-colors">
              Register Lounge
            </button>
            <a href="#cockpit" className="hover:text-current font-medium transition-colors">
              Telemetry Status
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
