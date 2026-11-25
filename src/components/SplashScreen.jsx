import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0) // 0: init, 1: logo expansion + rings, 2: text typewriter/reveal, 3: ready, 4: exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150)
    const t2 = setTimeout(() => setPhase(2), 700)
    const t3 = setTimeout(() => setPhase(3), 1600)
    const t4 = setTimeout(() => setPhase(4), 2600)
    const t5 = setTimeout(() => onFinish(), 3100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#fafbfc] transition-all duration-500 ease-in-out ${
        phase === 4 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Light-theme subtle ambient background grid & colored glowing orbs */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-orange-400/15 via-rose-400/15 to-transparent blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-purple-500/15 via-cyan-400/15 to-transparent blur-[90px]" />

      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Animated Expanding Rings around logo */}
        <div className="relative flex items-center justify-center">
          {/* Outermost expanding halo */}
          <div
            className={`absolute h-48 w-48 sm:h-56 sm:w-56 rounded-full border border-purple-200/60 bg-gradient-to-tr from-orange-100/30 to-purple-100/30 transition-all duration-1000 ease-out ${
              phase >= 1 ? 'scale-100 opacity-100 animate-pulse' : 'scale-50 opacity-0'
            }`}
          />
          {/* Secondary rotating accent border */}
          <div
            className={`absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full border border-dashed border-rose-300/70 transition-all duration-1000 ease-out ${
              phase >= 1 ? 'scale-100 opacity-80 animate-spin [animation-duration:18s]' : 'scale-70 opacity-0'
            }`}
          />

          {/* Logo container with light glassmorphism & soft shadow */}
          <div
            className={`relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-3xl bg-white p-2.5 shadow-[0_20px_50px_-10px_rgba(124,58,237,0.18),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/90 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
              phase >= 1 ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
            }`}
          >
            <img
              src="/logo.png?v=2"
              alt="VORA Logo"
              className="h-full w-full rounded-2xl object-contain drop-shadow-sm transition-transform duration-500 hover:scale-105"
            />
            {/* Corner glowing gaming accents */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </span>
          </div>
        </div>

        {/* Text sequence in crisp Light Theme */}
        <div className="mt-8 flex flex-col items-center text-center">
          {/* VORA Title */}
          <div
            className={`transition-all duration-700 ease-out ${
              phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-[0.25em] text-slate-900 drop-shadow-xs">
              VORA
            </h1>
          </div>

          {/* Meaning / Full Form Pill */}
          <div
            className={`mt-2.5 transition-all duration-700 delay-100 ease-out ${
              phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-gradient-to-r from-orange-50/80 via-rose-50/80 to-purple-50/80 px-4 py-1.5 shadow-xs backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-purple-700">
                Virtual Operations &amp; Recreation Organizer
              </p>
            </div>
          </div>

          {/* Subtitle tag */}
          <p
            className={`mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-all duration-700 delay-200 ease-out ${
              phase >= 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Gaming Lounge Management System
          </p>

          {/* Light-theme high-tech progress loading bar */}
          <div
            className={`mt-6 flex flex-col items-center gap-2 transition-all duration-700 ease-out ${
              phase >= 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-1.5 w-48 sm:w-64 overflow-hidden rounded-full bg-slate-200/80 border border-slate-300/40 p-[1px]">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 transition-all duration-1000 ease-out ${
                  phase >= 3 ? 'w-full' : phase >= 2 ? 'w-2/3' : 'w-10'
                }`}
              />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {phase >= 3 ? 'System Initialized · Ready' : 'Loading Station Telemetrics...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
