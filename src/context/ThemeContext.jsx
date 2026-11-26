import { createContext, useContext, useState, useEffect, useRef } from 'react'
import GamingModeTransition from '../components/GamingModeTransition'

export const COLOR_PALETTES = [
  {
    id: 'crimson',
    name: 'Crimson Obsidian',
    tag: 'Velvet & Cherry',
    preview: ['#D9184B', '#73142D', '#282828'],
    vars: {
      light: {
        '--bg-canvas': '#F8F9FA',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#F1F3F5',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#E9ECEF',
        '--bg-pill-hover': '#DEE2E6',
        '--border-hairline': 'rgba(60, 60, 60, 0.10)',
        '--border-strong': 'rgba(60, 60, 60, 0.22)',
        '--ink-primary': '#1E1E1E',
        '--ink-secondary': '#3C3C3C',
        '--ink-muted': '#6C757D',
        '--crimson': '#D9184B',
        '--crimson-hover': '#BF133F',
        '--crimson-soft': 'rgba(217, 24, 75, 0.10)',
        '--crimson-glow': 'rgba(217, 24, 75, 0.26)',
        '--wine': '#73142D',
        '--wine-soft': 'rgba(115, 20, 45, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(40, 40, 40, 0.05), 0 1px 3px rgba(40, 40, 40, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(217, 24, 75, 0.16), 0 4px 12px -2px rgba(40, 40, 40, 0.06)'
      },
      gaming: {
        '--bg-canvas': '#121214',
        '--bg-surface': '#1E1E22',
        '--bg-surface-soft': '#28282D',
        '--bg-desk': 'rgba(30, 30, 34, 0.94)',
        '--bg-pill': '#2C2C33',
        '--bg-pill-hover': '#383842',
        '--border-hairline': 'rgba(217, 24, 75, 0.22)',
        '--border-strong': 'rgba(217, 24, 75, 0.45)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#E9ECEF',
        '--ink-muted': '#ADB5BD',
        '--crimson': '#D9184B',
        '--crimson-hover': '#FF2B63',
        '--crimson-soft': 'rgba(217, 24, 75, 0.20)',
        '--crimson-glow': 'rgba(217, 24, 75, 0.42)',
        '--wine': '#73142D',
        '--wine-soft': 'rgba(115, 20, 45, 0.25)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(217, 24, 75, 0.15)',
        '--shadow-hover': '0 18px 45px -8px rgba(217, 24, 75, 0.35), 0 0 25px rgba(217, 24, 75, 0.25)'
      }
    },
    rgb: { co: [217, 24, 75], cp: [115, 20, 45], cc: [60, 60, 60] }
  },
  {
    id: 'cyber_cyan',
    name: 'Electric Cyan & Violet',
    tag: 'Esports Vapor',
    preview: ['#00F5D4', '#7928CA', '#080A14'],
    vars: {
      light: {
        '--bg-canvas': '#F1F5F9',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#F8FAFC',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#E2E8F0',
        '--bg-pill-hover': '#CBD5E1',
        '--border-hairline': 'rgba(0, 245, 212, 0.16)',
        '--border-strong': 'rgba(121, 40, 202, 0.25)',
        '--ink-primary': '#0F172A',
        '--ink-secondary': '#334155',
        '--ink-muted': '#64748B',
        '--crimson': '#00F5D4',
        '--crimson-hover': '#00D4B8',
        '--crimson-soft': 'rgba(0, 245, 212, 0.12)',
        '--crimson-glow': 'rgba(0, 245, 212, 0.30)',
        '--wine': '#7928CA',
        '--wine-soft': 'rgba(121, 40, 202, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(0, 245, 212, 0.08), 0 1px 3px rgba(15, 23, 42, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(0, 245, 212, 0.22), 0 4px 12px -2px rgba(121, 40, 202, 0.10)'
      },
      gaming: {
        '--bg-canvas': '#070913',
        '--bg-surface': '#0E1322',
        '--bg-surface-soft': '#141A30',
        '--bg-desk': 'rgba(14, 19, 34, 0.94)',
        '--bg-pill': '#1B233C',
        '--bg-pill-hover': '#242F50',
        '--border-hairline': 'rgba(0, 245, 212, 0.25)',
        '--border-strong': 'rgba(0, 245, 212, 0.50)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#E2E8F0',
        '--ink-muted': '#94A3B8',
        '--crimson': '#00F5D4',
        '--crimson-hover': '#33FFDF',
        '--crimson-soft': 'rgba(0, 245, 212, 0.22)',
        '--crimson-glow': 'rgba(0, 245, 212, 0.45)',
        '--wine': '#9D4EDD',
        '--wine-soft': 'rgba(157, 78, 221, 0.25)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(0, 245, 212, 0.20)',
        '--shadow-hover': '0 18px 45px -8px rgba(0, 245, 212, 0.38), 0 0 25px rgba(157, 78, 221, 0.30)'
      }
    },
    rgb: { co: [0, 245, 212], cp: [121, 40, 202], cc: [14, 19, 34] }
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    tag: 'Cyber Mint & Jade',
    preview: ['#05FFA1', '#0B7A54', '#06130D'],
    vars: {
      light: {
        '--bg-canvas': '#F0F9F5',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#E6F4ED',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#D1EBE0',
        '--bg-pill-hover': '#BFE3D4',
        '--border-hairline': 'rgba(5, 255, 161, 0.18)',
        '--border-strong': 'rgba(11, 122, 84, 0.25)',
        '--ink-primary': '#062B1D',
        '--ink-secondary': '#114B35',
        '--ink-muted': '#4E7D6B',
        '--crimson': '#00B871',
        '--crimson-hover': '#009E60',
        '--crimson-soft': 'rgba(5, 255, 161, 0.12)',
        '--crimson-glow': 'rgba(5, 255, 161, 0.30)',
        '--wine': '#0B7A54',
        '--wine-soft': 'rgba(11, 122, 84, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(5, 255, 161, 0.08), 0 1px 3px rgba(6, 43, 29, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(5, 255, 161, 0.22), 0 4px 12px -2px rgba(11, 122, 84, 0.12)'
      },
      gaming: {
        '--bg-canvas': '#06120C',
        '--bg-surface': '#0D1E16',
        '--bg-surface-soft': '#132C20',
        '--bg-desk': 'rgba(13, 30, 22, 0.94)',
        '--bg-pill': '#1A392B',
        '--bg-pill-hover': '#234C3A',
        '--border-hairline': 'rgba(5, 255, 161, 0.25)',
        '--border-strong': 'rgba(5, 255, 161, 0.50)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#D1EBE0',
        '--ink-muted': '#8CB8A5',
        '--crimson': '#05FFA1',
        '--crimson-hover': '#3DFFB8',
        '--crimson-soft': 'rgba(5, 255, 161, 0.22)',
        '--crimson-glow': 'rgba(5, 255, 161, 0.45)',
        '--wine': '#0B7A54',
        '--wine-soft': 'rgba(11, 122, 84, 0.25)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(5, 255, 161, 0.20)',
        '--shadow-hover': '0 18px 45px -8px rgba(5, 255, 161, 0.38), 0 0 25px rgba(11, 122, 84, 0.30)'
      }
    },
    rgb: { co: [5, 255, 161], cp: [11, 122, 84], cc: [6, 18, 12] }
  },
  {
    id: 'solar_amber',
    name: 'Solar Amber & Flame',
    tag: 'Golden Horizon',
    preview: ['#FF9E00', '#D84A00', '#181206'],
    vars: {
      light: {
        '--bg-canvas': '#FFF9F0',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#FFF1DE',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#FFE3BD',
        '--bg-pill-hover': '#FED49B',
        '--border-hairline': 'rgba(255, 158, 0, 0.16)',
        '--border-strong': 'rgba(216, 74, 0, 0.25)',
        '--ink-primary': '#291800',
        '--ink-secondary': '#4A2C00',
        '--ink-muted': '#7D5C2E',
        '--crimson': '#EA7A00',
        '--crimson-hover': '#CC6800',
        '--crimson-soft': 'rgba(255, 158, 0, 0.12)',
        '--crimson-glow': 'rgba(255, 158, 0, 0.28)',
        '--wine': '#D84A00',
        '--wine-soft': 'rgba(216, 74, 0, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(255, 158, 0, 0.08), 0 1px 3px rgba(41, 24, 0, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(255, 158, 0, 0.20), 0 4px 12px -2px rgba(216, 74, 0, 0.12)'
      },
      gaming: {
        '--bg-canvas': '#140E04',
        '--bg-surface': '#201607',
        '--bg-surface-soft': '#2E200C',
        '--bg-desk': 'rgba(32, 22, 7, 0.94)',
        '--bg-pill': '#3D2A10',
        '--bg-pill-hover': '#4E3615',
        '--border-hairline': 'rgba(255, 158, 0, 0.25)',
        '--border-strong': 'rgba(255, 158, 0, 0.50)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#FFE8C8',
        '--ink-muted': '#B89B74',
        '--crimson': '#FF9E00',
        '--crimson-hover': '#FFB033',
        '--crimson-soft': 'rgba(255, 158, 0, 0.22)',
        '--crimson-glow': 'rgba(255, 158, 0, 0.45)',
        '--wine': '#FF5400',
        '--wine-soft': 'rgba(255, 84, 0, 0.25)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(255, 158, 0, 0.20)',
        '--shadow-hover': '0 18px 45px -8px rgba(255, 158, 0, 0.38), 0 0 25px rgba(255, 84, 0, 0.30)'
      }
    },
    rgb: { co: [255, 158, 0], cp: [216, 74, 0], cc: [20, 14, 4] }
  },
  {
    id: 'vivid_purple',
    name: 'Ultra Violet & Magenta',
    tag: 'Deep Synthwave',
    preview: ['#A855F7', '#EC4899', '#0E0918'],
    vars: {
      light: {
        '--bg-canvas': '#FAF5FF',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#F3E8FF',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#E9D5FF',
        '--bg-pill-hover': '#D8B4FE',
        '--border-hairline': 'rgba(168, 85, 247, 0.16)',
        '--border-strong': 'rgba(236, 72, 153, 0.25)',
        '--ink-primary': '#1E0C30',
        '--ink-secondary': '#3B1861',
        '--ink-muted': '#725299',
        '--crimson': '#9333EA',
        '--crimson-hover': '#7E22CE',
        '--crimson-soft': 'rgba(168, 85, 247, 0.12)',
        '--crimson-glow': 'rgba(168, 85, 247, 0.28)',
        '--wine': '#DB2777',
        '--wine-soft': 'rgba(219, 39, 119, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(168, 85, 247, 0.08), 0 1px 3px rgba(30, 12, 48, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(168, 85, 247, 0.22), 0 4px 12px -2px rgba(219, 39, 119, 0.12)'
      },
      gaming: {
        '--bg-canvas': '#0B0714',
        '--bg-surface': '#140D24',
        '--bg-surface-soft': '#1D1333',
        '--bg-desk': 'rgba(20, 13, 36, 0.94)',
        '--bg-pill': '#291B47',
        '--bg-pill-hover': '#35235C',
        '--border-hairline': 'rgba(168, 85, 247, 0.25)',
        '--border-strong': 'rgba(168, 85, 247, 0.50)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#E9D5FF',
        '--ink-muted': '#A78BFA',
        '--crimson': '#C084FC',
        '--crimson-hover': '#D8B4FE',
        '--crimson-soft': 'rgba(192, 132, 252, 0.22)',
        '--crimson-glow': 'rgba(192, 132, 252, 0.45)',
        '--wine': '#F472B6',
        '--wine-soft': 'rgba(244, 114, 182, 0.25)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(168, 85, 247, 0.20)',
        '--shadow-hover': '0 18px 45px -8px rgba(192, 132, 252, 0.38), 0 0 25px rgba(244, 114, 182, 0.30)'
      }
    },
    rgb: { co: [168, 85, 247], cp: [236, 72, 153], cc: [11, 7, 20] }
  },
  {
    id: 'pure_monochrome',
    name: 'Carbon Monochrome',
    tag: 'Minimal Stealth',
    preview: ['#E2E8F0', '#64748B', '#0F172A'],
    vars: {
      light: {
        '--bg-canvas': '#F8FAFC',
        '--bg-surface': '#FFFFFF',
        '--bg-surface-soft': '#F1F5F9',
        '--bg-desk': 'rgba(255, 255, 255, 0.94)',
        '--bg-pill': '#E2E8F0',
        '--bg-pill-hover': '#CBD5E1',
        '--border-hairline': 'rgba(15, 23, 42, 0.10)',
        '--border-strong': 'rgba(15, 23, 42, 0.22)',
        '--ink-primary': '#0F172A',
        '--ink-secondary': '#334155',
        '--ink-muted': '#64748B',
        '--crimson': '#334155',
        '--crimson-hover': '#1E293B',
        '--crimson-soft': 'rgba(51, 65, 85, 0.10)',
        '--crimson-glow': 'rgba(51, 65, 85, 0.25)',
        '--wine': '#64748B',
        '--wine-soft': 'rgba(100, 116, 139, 0.12)',
        '--shadow-card': '0 4px 18px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)',
        '--shadow-hover': '0 16px 36px -8px rgba(51, 65, 85, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.06)'
      },
      gaming: {
        '--bg-canvas': '#0B0F19',
        '--bg-surface': '#131B2E',
        '--bg-surface-soft': '#1B2640',
        '--bg-desk': 'rgba(19, 27, 46, 0.94)',
        '--bg-pill': '#253457',
        '--bg-pill-hover': '#30426E',
        '--border-hairline': 'rgba(226, 232, 240, 0.20)',
        '--border-strong': 'rgba(226, 232, 240, 0.45)',
        '--ink-primary': '#FFFFFF',
        '--ink-secondary': '#E2E8F0',
        '--ink-muted': '#94A3B8',
        '--crimson': '#E2E8F0',
        '--crimson-hover': '#FFFFFF',
        '--crimson-soft': 'rgba(226, 232, 240, 0.18)',
        '--crimson-glow': 'rgba(226, 232, 240, 0.40)',
        '--wine': '#94A3B8',
        '--wine-soft': 'rgba(148, 163, 184, 0.20)',
        '--shadow-card': '0 8px 30px -4px rgba(0, 0, 0, 0.85), 0 0 15px -2px rgba(226, 232, 240, 0.15)',
        '--shadow-hover': '0 18px 45px -8px rgba(226, 232, 240, 0.30), 0 0 25px rgba(148, 163, 184, 0.20)'
      }
    },
    rgb: { co: [226, 232, 240], cp: [148, 163, 184], cc: [11, 15, 25] }
  }
]

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Mode: 'light' or 'gaming'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('voro_theme') || 'light'
  })

  // Selected Palette ID
  const [paletteId, setPaletteId] = useState(() => {
    return localStorage.getItem('voro_palette') || 'crimson'
  })

  const [animState, setAnimState] = useState({ active: false, mode: 'enter' })
  const isTransitioningRef = useRef(false)

  // Find active palette config
  const activePalette = COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0]

  // Apply CSS variables and theme class whenever theme or palette changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'gaming') {
      root.classList.add('gaming-mode')
      root.setAttribute('data-theme', 'gaming')
    } else {
      root.classList.remove('gaming-mode')
      root.setAttribute('data-theme', 'light')
    }

    const currentVars = activePalette.vars[theme] || activePalette.vars.light
    Object.entries(currentVars).forEach(([key, val]) => {
      root.style.setProperty(key, val)
    })

    localStorage.setItem('voro_theme', theme)
    localStorage.setItem('voro_palette', paletteId)
  }, [theme, paletteId, activePalette])

  const toggleTheme = () => {
    if (isTransitioningRef.current) return

    if (theme === 'light') {
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'enter' })
    } else {
      isTransitioningRef.current = true
      setAnimState({ active: true, mode: 'exit' })
    }
  }

  const handleAnimationSwitch = () => {
    const root = document.documentElement
    const nextTheme = animState.mode === 'enter' ? 'gaming' : 'light'

    if (nextTheme === 'gaming') {
      root.classList.add('gaming-mode')
      root.setAttribute('data-theme', 'gaming')
    } else {
      root.classList.remove('gaming-mode')
      root.setAttribute('data-theme', 'light')
    }

    const currentVars = activePalette.vars[nextTheme] || activePalette.vars.light
    Object.entries(currentVars).forEach(([key, val]) => {
      root.style.setProperty(key, val)
    })
    localStorage.setItem('voro_theme', nextTheme)
  }

  const handleAnimationDone = () => {
    setTheme(animState.mode === 'enter' ? 'gaming' : 'light')
    setAnimState({ active: false, mode: 'enter' })
    isTransitioningRef.current = false
  }

  const selectPalette = (id) => {
    setPaletteId(id)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isGaming: theme === 'gaming',
        toggleTheme,
        paletteId,
        selectPalette,
        activePalette,
        palettes: COLOR_PALETTES
      }}
    >
      {children}
      <GamingModeTransition 
        active={animState.active}
        mode={animState.mode}
        palette={activePalette}
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
      paletteId: 'crimson',
      selectPalette: () => {},
      activePalette: COLOR_PALETTES[0],
      palettes: COLOR_PALETTES
    }
  }
  return ctx
}
