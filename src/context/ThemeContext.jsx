import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Mode can be 'light' or 'gaming'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('voro_theme') || 'light'
  })

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
    setTheme((prev) => (prev === 'gaming' ? 'light' : 'gaming'))
  }

  const setGamingMode = () => setTheme('gaming')
  const setLightMode = () => setTheme('light')

  return (
    <ThemeContext.Provider value={{ theme, isGaming: theme === 'gaming', toggleTheme, setGamingMode, setLightMode }}>
      {children}
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
