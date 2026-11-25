import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState(0) // 0: intro, 1: text reveal, 2: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500)
    const t2 = setTimeout(() => setStage(2), 2200)
    const t3 = setTimeout(() => onFinish(), 2700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onFinish])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090b10] text-white transition-opacity duration-500 ${
        stage === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient neon glows */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-tr from-brand-600/30 to-rose-500/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px]" />

      <div className="relative flex flex-col items-center text-center px-4">
        {/* Logo with 3D glow frame */}
        <div
          className={`relative transform transition-all duration-700 ease-out ${
            stage >= 0 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-3xl bg-black/60 p-1.5 shadow-[0_0_50px_rgba(124,58,237,0.4)] ring-1 ring-white/10">
            <img
              src="/voro-logo.jpg"
              alt="VORA Logo"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
          {/* Subtle pulse ring around logo */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 opacity-40 blur-md -z-10 animate-pulse" />
        </div>

        {/* Brand Name & Meaning */}
        <div
          className={`mt-6 transform transition-all duration-700 delay-150 ease-out ${
            stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            VORA
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400">
            Virtual Operations &amp; Recreation Organizer
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Next-Gen Gaming Lounge OS
            </p>
          </div>
        </div>

        {/* Progress bar loader */}
        <div className="mt-8 h-1 w-48 sm:w-64 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 transition-all duration-1000 ease-out ${
              stage >= 1 ? 'w-full' : 'w-12'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
