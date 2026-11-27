import React, { useState, useEffect, useRef } from 'react'

export default function WelcomeScreen({ onFinish }) {
  // Intro stage transitions:
  // 0: hidden
  // 1: "Welcome to VORA" glides in with soft scale + blur de-focus (entrance animation)
  // 2: "Welcome to " dissolves, VORA centers
  // 3: V-O-R-O letters glide apart and unroll words
  const [stage, setStage] = useState(0)
  const [fadingOut, setFadingOut] = useState(false)
  const audioPlayedRef = useRef(false)

  const playVoice = () => {
    if (audioPlayedRef.current) return
    audioPlayedRef.current = true
    try {
      const audio = new Audio('/welcome-vora.mp3')
      audio.volume = 1.0
      audio.play().catch(e => console.warn('Audio play error:', e))
    } catch (e) {
      console.warn('Audio error:', e)
    }
  }

  useEffect(() => {
    // 1. Entrance animation starts after slight 150ms beat
    const t0 = setTimeout(() => {
      setStage(1)
      playVoice()
    }, 150)

    // 2. Dissolve "Welcome to " at 2.4s
    const t1 = setTimeout(() => {
      setStage(2)
    }, 2400)

    // 3. Letters space out and unroll words at 3.0s
    const t2 = setTimeout(() => {
      setStage(3)
    }, 3000)

    // 4. Silky-smooth crossfade out into the website at 5.5s
    const t3 = setTimeout(() => {
      setFadingOut(true)
      // Generous 1100ms fade allows the website below to reveal seamlessly
      setTimeout(() => {
        if (onFinish) onFinish()
      }, 1050)
    }, 5500)

    const handleFirstGesture = () => {
      playVoice()
    }
    window.addEventListener('pointerdown', handleFirstGesture, { once: true })

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('pointerdown', handleFirstGesture)
    }
  }, [onFinish])

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center select-none cursor-default overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        fadingOut 
          ? 'opacity-0 scale-[1.02] filter blur-[3px] pointer-events-none' 
          : 'opacity-100 scale-100 filter-none'
      }`}
    >
      <div className="relative text-center px-4 max-w-6xl mx-auto flex items-center justify-center min-h-[160px]">
        
        {/* "Welcome to " - Animated Entrance + Smooth Collapse */}
        <span 
          className={`font-sans tracking-tight text-neutral-900 font-light inline-block overflow-hidden whitespace-nowrap text-[clamp(2rem,5vw,4.5rem)] transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
            stage === 0
              ? 'opacity-0 translate-y-6 scale-95 blur-[4px] max-w-[450px] pr-3.5 duration-1000'
              : stage === 1
                ? 'opacity-100 translate-y-0 scale-100 filter-none max-w-[450px] pr-3.5 duration-1000'
                : 'opacity-0 -translate-x-10 max-w-0 pr-0 duration-700'
          }`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Welcome to
        </span>

        {/* V O R O Letters Container */}
        <div 
          className={`inline-flex items-baseline whitespace-nowrap transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            stage >= 3 ? 'gap-4 sm:gap-7' : 'gap-0'
          }`}
        >

          {/* Letter V */}
          <div className="inline-flex items-baseline">
            <span 
              className={`font-sans font-black text-[#D9184B] text-[clamp(2.5rem,6vw,5.5rem)] transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 0 
                  ? 'opacity-0 translate-y-6 scale-95 blur-[4px] duration-1000' 
                  : 'opacity-100 translate-y-0 scale-100 filter-none duration-1000'
              }`}
            >
              V
            </span>
            <span 
              className={`font-sans font-medium text-neutral-800 text-[clamp(1.4rem,3.6vw,3.4rem)] overflow-hidden inline-block transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage >= 3
                  ? 'max-w-[260px] opacity-100 translate-x-0'
                  : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              irtual
            </span>
          </div>

          {/* Letter O */}
          <div className="inline-flex items-baseline">
            <span 
              className={`font-sans font-black text-[#D9184B] text-[clamp(2.5rem,6vw,5.5rem)] transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 0 
                  ? 'opacity-0 translate-y-6 scale-95 blur-[4px] duration-1000 delay-75' 
                  : 'opacity-100 translate-y-0 scale-100 filter-none duration-1000'
              }`}
            >
              O
            </span>
            <span 
              className={`font-sans font-medium text-neutral-800 text-[clamp(1.4rem,3.6vw,3.4rem)] overflow-hidden inline-block transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage >= 3
                  ? 'max-w-[320px] opacity-100 translate-x-0'
                  : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              perations
            </span>
          </div>

          {/* Letter R */}
          <div className="inline-flex items-baseline">
            <span 
              className={`font-sans font-black text-[#D9184B] text-[clamp(2.5rem,6vw,5.5rem)] transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 0 
                  ? 'opacity-0 translate-y-6 scale-95 blur-[4px] duration-1000 delay-150' 
                  : 'opacity-100 translate-y-0 scale-100 filter-none duration-1000'
              }`}
            >
              R
            </span>
            <span 
              className={`font-sans font-medium text-neutral-800 text-[clamp(1.4rem,3.6vw,3.4rem)] overflow-hidden inline-block transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage >= 3
                  ? 'max-w-[320px] opacity-100 translate-x-0'
                  : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              ecreation
            </span>
          </div>

          {/* Letter O */}
          <div className="inline-flex items-baseline">
            <span 
              className={`font-sans font-black text-[#D9184B] text-[clamp(2.5rem,6vw,5.5rem)] transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage === 0 
                  ? 'opacity-0 translate-y-6 scale-95 blur-[4px] duration-1000 delay-200' 
                  : 'opacity-100 translate-y-0 scale-100 filter-none duration-1000'
              }`}
            >
              O
            </span>
            <span 
              className={`font-sans font-medium text-neutral-800 text-[clamp(1.4rem,3.6vw,3.4rem)] overflow-hidden inline-block transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                stage >= 3
                  ? 'max-w-[300px] opacity-100 translate-x-0'
                  : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              rganizer
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}
