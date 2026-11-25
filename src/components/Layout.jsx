import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Gamepad2, Car, History, BarChart3, Settings, 
  LogOut, Menu, X, WifiOff, Plus, Zap, Shield, Sun, Flame 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { useFlows } from './Flows'
import { cx } from './ui'
import { VORA_LOGO } from '../lib/logoData'

const NAV = [
  ['/', 'Command Center', LayoutDashboard], 
  ['/stations', 'PlayStation Zones', Gamepad2], 
  ['/simulators', 'Racing Rigs', Car],
  ['/history', 'Session Archives', History], 
  ['/reports', 'Analytics & Revenue', BarChart3, true], 
  ['/settings', 'System Settings', Settings, true],
]

export default function Layout({ children }) {
  const { profile, isAdmin, signOut } = useAuth()
  const { settings, online, error, active } = useData()
  const { isGaming, toggleTheme } = useTheme()
  const { openCheckIn } = useFlows()
  const [open, setOpen] = useState(false)
  const name = settings?.cafe_name || 'VORA'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-5 max-w-[1640px] mx-auto p-3 sm:p-5">
      {/* 1. Zone 1: Floating Icon Rail (Desktop) */}
      <aside className="hidden lg:flex sticky top-5 h-[calc(100vh-40px)] w-[76px] flex-col items-center justify-between rounded-[26px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-rail)] p-3.5 z-40 transition-all duration-300">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Brand Icon */}
          <NavLink to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--indigo)] to-[#8375FF] p-1.5 flex items-center justify-center shadow-lg shadow-[var(--indigo-glow)] transition-transform hover:scale-105">
            <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain rounded-xl" />
          </NavLink>

          {/* Navigation Links with Hover Tooltip */}
          <nav className="flex flex-col items-center gap-2.5 w-full">
            {NAV.filter((n) => !n[3] || isAdmin).map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => cx(
                  'group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
                  isActive 
                    ? 'bg-[var(--indigo)] text-white shadow-md shadow-[var(--indigo-glow)]' 
                    : 'text-[var(--ink-muted)] hover:bg-[var(--bg-pill)] hover:text-[var(--ink-primary)]'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {/* Tooltip */}
                    <span className="absolute left-[calc(100%+14px)] px-3 py-1.5 rounded-full bg-[var(--ink-primary)] text-[var(--bg-surface)] text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-150 z-50 shadow-xl">
                      {label}
                    </span>
                    {to === '/' && active?.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--coral)] text-white text-[9px] font-black shadow-sm">
                        {active.length}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={toggleTheme}
            title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--bg-pill)] text-[var(--ink-primary)] hover:bg-[var(--bg-pill-hover)] transition-transform hover:scale-105"
          >
            {isGaming ? <Flame className="w-5 h-5 text-[var(--coral)] animate-pulse" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </button>

          <button
            onClick={signOut}
            title="Sign out"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold text-xs shadow-md hover:scale-105 transition-transform"
          >
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside 
            className="absolute left-0 top-0 flex h-full w-[80vw] max-w-xs flex-col bg-[var(--bg-surface)] shadow-2xl z-10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)] mb-4">
              <div className="flex items-center gap-2.5">
                <img src={VORA_LOGO} alt="VORA" className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-1" />
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">{name}</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--coral)]">V.O.R.A. GAMING OS</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-xl text-[var(--ink-muted)] hover:bg-[var(--bg-pill)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              {NAV.filter((n) => !n[3] || isAdmin).map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                    isActive ? 'bg-[var(--indigo)] text-white shadow-md' : 'text-[var(--ink-muted)] hover:bg-[var(--bg-pill)]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink-secondary)]">{profile?.full_name || 'Staff'}</span>
              <button onClick={signOut} className="text-xs font-bold text-rose-500 hover:underline">Sign out</button>
            </div>
          </aside>
        </div>
      )}

      {/* 2. Main Workspace (Center + Integrated Operations) */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-3 px-1 py-1">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setOpen(true)} 
              className="lg:hidden p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--ink-muted)]">
                  OPERATIONS DESK
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--indigo)]">
                  LIVE TELEMETRY
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
                {name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--emerald-soft)] text-[var(--emerald)] text-xs font-extrabold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--emerald)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--emerald)]"></span>
              </span>
              <span>LIVE SYSTEM</span>
            </div>

            <button
              onClick={toggleTheme}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--ink-primary)] shadow-sm hover:border-[var(--border-strong)] transition-all"
            >
              {isGaming ? (
                <>
                  <Flame className="w-4 h-4 text-[var(--coral)] animate-pulse" />
                  <span className="font-extrabold text-[var(--coral)]">GAMING MODE</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>LIGHT MODE</span>
                </>
              )}
            </button>

            <button
              onClick={() => openCheckIn()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--indigo)] hover:bg-[var(--indigo-hover)] text-white text-xs sm:text-sm font-bold shadow-md shadow-[var(--indigo-glow)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Start Session</span>
            </button>
          </div>
        </header>

        {(!online || error) && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-300/40 rounded-2xl px-4 py-2.5 text-xs font-semibold text-amber-800">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">{!online ? 'Offline mode active. Timers count locally.' : `Server message: ${error}`}</span>
          </div>
        )}

        {/* Stage Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
