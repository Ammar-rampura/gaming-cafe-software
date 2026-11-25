import { useEffect, useState } from 'react'
import { VORA_LOGO } from '../lib/logoData'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0) // 0: enter, 1: pulse/glow, 2: ready, 3: exit
  const [progress, setProgress] = useState(15)

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase(1); setProgress(55) }, 200)
    const t2 = setTimeout(() => { setPhase(2); setProgress(100) }, 1000)
    const t3 = setTimeout(() => setPhase(3), 1900)
    const t4 = setTimeout(() => onFinish(), 2400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#f1f5f9] transition-all duration-500 ease-in-out ${
        phase === 3 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Light-theme ambient dot-grid background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.35) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Warm ambient sunset glowing orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-orange-400/20 via-rose-400/15 to-transparent blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-purple-500/20 via-indigo-400/15 to-transparent blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center px-4 max-w-md w-full">
        {/* Animated Rotating Rings around VORA Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Glow Ring */}
          <div
            className={`absolute h-52 w-52 rounded-full border border-purple-200/70 bg-gradient-to-tr from-orange-100/40 via-rose-100/30 to-purple-100/40 transition-all duration-700 ease-out ${
              phase >= 1 ? 'scale-100 opacity-100 animate-pulse' : 'scale-50 opacity-0'
            }`}
          />
          {/* Rotating Dashed Orbit Ring */}
          <div
            className={`absolute h-44 w-44 rounded-full border border-dashed border-rose-300/80 transition-all duration-1000 ease-out ${
              phase >= 1 ? 'scale-100 opacity-80 animate-spin [animation-duration:15s]' : 'scale-70 opacity-0'
            }`}
          />

          {/* Logo Card with floating depth */}
          <div
            className={`relative flex h-32 w-32 items-center justify-center rounded-3xl bg-white p-3 shadow-[0_20px_50px_-10px_rgba(124,58,237,0.22),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-200/90 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
              phase >= 1 ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
            }`}
          >
            <img
              src={VORA_LOGO}
              alt="VORA"
              className="h-full w-full object-contain"
            />
            {/* Live active beacon */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </span>
          </div>
        </div>

        {/* Text Sequence */}
        <div className="mt-7 flex flex-col items-center text-center">
          <div
            className={`transition-all duration-500 ease-out ${
              phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <h1 className="font-display text-4xl font-black tracking-[0.25em] text-slate-900 drop-shadow-xs">
              VORA
            </h1>
          </div>

          <div
            className={`mt-2 transition-all duration-500 delay-100 ease-out ${
              phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-rose-600 to-purple-700">
                Virtual Operations &amp; Recreation Organizer
              </p>
            </div>
          </div>

          <p
            className={`mt-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-all duration-500 delay-150 ease-out ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Next-Gen Gaming Lounge OS
          </p>

          {/* High-tech animated progress bar */}
          <div
            className={`mt-6 w-56 flex flex-col items-center gap-1.5 transition-all duration-500 ease-out ${
              phase >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 border border-slate-300/40 p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {progress >= 100 ? 'System Initialized · Live' : 'Booting Station Matrix...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
