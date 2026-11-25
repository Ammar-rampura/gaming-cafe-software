import { createContext, useContext, useState, useEffect, useRef } from 'react'
import GamingModeTransition from '../components/GamingModeTransition'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Mode can be 'light' or 'gaming'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('voro_theme') || 'light'
  })
  const [animState, setAnimState] = useState({ active: false, mode: 'enter' }) // mode: 'enter' | 'exit'
  const isTransitioningRef = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'gaming') {
      root.classList.add('gaming-mode')
      root.setAttribute('data-theme', 'gaming')
    } else {
      root.classList.remove('gaming-mode')
      root.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('voro_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    if (isTransitioningRef.current) return

    if (theme === 'light') {
      // Trigger hex transition entering gaming mode
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'enter' })
    } else {
      // Trigger reverse hex transition exiting gaming mode
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'exit' })
    }
  }

  const handleAnimationSwitch = () => {
    const root = document.documentElement
    if (animState.mode === 'enter') {
      root.classList.add('gaming-mode')
      root.setAttribute('data-theme', 'gaming')
      localStorage.setItem('voro_theme', 'gaming')
    } else {
      root.classList.remove('gaming-mode')
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('voro_theme', 'light')
    }
  }

  const handleAnimationDone = () => {
    setTheme(animState.mode === 'enter' ? 'gaming' : 'light')
    setAnimState({ active: false, mode: 'enter' })
    isTransitioningRef.current = false
  }

  const setGamingMode = () => {
    if (theme !== 'gaming' && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'enter' })
    }
  }

  const setLightMode = () => {
    if (theme !== 'light' && !isTransitioningRef.current) {
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'exit' })
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, isGaming: theme === 'gaming', toggleTheme, setGamingMode, setLightMode }}>
      {children}
      <GamingModeTransition 
        active={animState.active}
        mode={animState.mode}
        onSwitch={handleAnimationSwitch}
        onDone={handleAnimationDone} 
      />
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: 'light',
      isGaming: false,
      toggleTheme: () => {},
      setGamingMode: () => {},
      setLightMode: () => {}
    }
  }
  return ctx
}
