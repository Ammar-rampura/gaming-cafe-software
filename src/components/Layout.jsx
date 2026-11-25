import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Gamepad2, Car, History, BarChart3, Settings, 
  Menu, X, WifiOff, Plus, Sun, Flame, LogOut 
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
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 sm:gap-5 max-w-[1640px] mx-auto p-2.5 sm:p-5 pb-20 lg:pb-5">
      {/* 1. Zone 1: Floating Icon Rail (Desktop) */}
      <aside className="hidden lg:flex sticky top-5 h-[calc(100vh-40px)] w-[76px] flex-col items-center justify-between rounded-[26px] bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-[var(--shadow-rail)] p-3.5 z-40 transition-all duration-300">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo Brand Icon with Crimson Obsidian Glow */}
          <NavLink to="/" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--crimson)] to-[var(--wine)] p-1.5 flex items-center justify-center shadow-lg shadow-[var(--crimson-glow)] transition-transform hover:scale-105">
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
                    ? 'bg-gradient-to-br from-[var(--crimson)] to-[var(--wine)] text-white shadow-lg shadow-[var(--crimson-glow)]' 
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
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--crimson)] text-white text-[9px] font-black shadow-sm">
                        {active.length}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile & Theme Toggle */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={toggleTheme}
            title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--bg-pill)] text-[var(--ink-primary)] hover:bg-[var(--bg-pill-hover)] transition-transform hover:scale-105"
          >
            {isGaming ? <Flame className="w-5 h-5 text-[var(--crimson)] animate-pulse" /> : <Sun className="w-5 h-5 text-amber-500" />}
          </button>

          <button
            onClick={signOut}
            title="Sign out"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--crimson)] to-[var(--wine)] text-white font-black text-xs shadow-md hover:scale-105 transition-transform"
          >
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside 
            className="absolute left-0 top-0 flex h-full w-[82vw] max-w-xs flex-col bg-[var(--bg-surface)] shadow-2xl z-10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)] mb-4">
              <div className="flex items-center gap-2.5">
                <img src={VORA_LOGO} alt="VORA" className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-1" />
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">{name}</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--crimson)]">V.O.R.A. GAMING OS</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl text-[var(--ink-muted)] hover:bg-[var(--bg-pill)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Theme Switch Button inside drawer */}
            <div className="mb-4 p-3 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink-secondary)]">Interface Theme</span>
              <button
                onClick={() => {
                  toggleTheme()
                  setOpen(false)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-pill)] text-xs font-extrabold text-[var(--ink-primary)]"
              >
                {isGaming ? (
                  <>
                    <Flame className="w-4 h-4 text-[var(--crimson)] animate-pulse" />
                    <span>Gaming Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Mode</span>
                  </>
                )}
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
                    'flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all',
                    isActive ? 'bg-[var(--crimson)] text-white shadow-md' : 'text-[var(--ink-muted)] hover:bg-[var(--bg-pill)]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--ink-primary)]">{profile?.full_name || 'Staff'}</p>
                <span className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider">{profile?.role || 'Admin'}</span>
              </div>
              <button onClick={signOut} className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline">
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 2. Main Workspace (Center + Integrated Operations) */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-5">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-2.5 px-1 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              onClick={() => setOpen(true)} 
              className="lg:hidden p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-primary)] shadow-sm shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[var(--ink-muted)]">
                <span className="truncate">OPERATIONS</span>
                <span className="text-slate-400">/</span>
                <span className="text-[var(--crimson)] truncate">LIVE</span>
              </div>
              <h1 className="font-display text-base sm:text-2xl font-bold tracking-tight text-[var(--ink-primary)] truncate">
                {name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Indicator */}
            <div className="hidden xs:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[var(--crimson-soft)] text-[var(--crimson)] text-[11px] sm:text-xs font-extrabold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--crimson)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--crimson)]"></span>
              </span>
              <span className="hidden sm:inline">LIVE SYSTEM</span>
            </div>

            {/* Theme Toggle Button (Always visible on mobile & desktop!) */}
            <button
              onClick={toggleTheme}
              title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-xs font-bold text-[var(--ink-primary)] shadow-sm hover:border-[var(--border-strong)] transition-all cursor-pointer select-none"
            >
              {isGaming ? (
                <>
                  <Flame className="w-4 h-4 text-[var(--crimson)] animate-pulse" />
                  <span className="font-extrabold text-[var(--crimson)] text-[11px] sm:text-xs">GAMING</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] sm:text-xs">LIGHT</span>
                </>
              )}
            </button>

            {/* Quick Check-In CTA */}
            <button
              onClick={() => openCheckIn()}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[var(--crimson)] to-[var(--wine)] text-white text-xs sm:text-sm font-bold shadow-md shadow-[var(--crimson-glow)] transition-all active:scale-95 hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Start Session</span>
              <span className="sm:hidden font-extrabold">Start</span>
            </button>
          </div>
        </header>

        {(!online || error) && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-300/40 rounded-2xl px-3.5 py-2 text-xs font-semibold text-amber-800">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">{!online ? 'Offline mode active.' : `Server message: ${error}`}</span>
          </div>
        )}

        {/* Stage Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Action Bar (Fixed at bottom on phones) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md px-2 py-2 lg:hidden shadow-lg">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-1 rounded-xl py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-[var(--crimson)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/stations" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-1 rounded-xl py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-[var(--crimson)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
          )}
        >
          <Gamepad2 className="h-4 w-4" />
          <span>PS5</span>
        </NavLink>

        <button 
          onClick={() => openCheckIn()}
          className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--crimson)] to-[var(--wine)] text-white shadow-lg shadow-[var(--crimson-glow)] active:scale-95"
          aria-label="Start new session"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <NavLink 
          to="/simulators" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-1 rounded-xl py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-[var(--crimson)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
          )}
        >
          <Car className="h-4 w-4" />
          <span>Rigs</span>
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-1 rounded-xl py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-[var(--crimson)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
          )}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </NavLink>
      </div>
    </div>
  )
}
