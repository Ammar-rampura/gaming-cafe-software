import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Gamepad2, Car, History, BarChart3, Settings, 
  LogOut, Menu, X, WifiOff, Plus, Zap, Shield, ChevronRight, Sun, Flame 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { useFlows } from './Flows'
import { Button, cx } from './ui'
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

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-3 overflow-y-auto">
      <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
        Operations Menu
      </div>
      {NAV.filter((n) => !n[3] || isAdmin).map(([to, label, Icon]) => (
        <NavLink 
          key={to} 
          to={to} 
          end={to === '/'} 
          onClick={() => setOpen(false)}
          className={({ isActive }) => cx(
            'group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all duration-150',
            isActive 
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70'
          )}>
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon className={cx('h-4 w-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-600')} />
                <span className="text-sm sm:text-xs">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {to === '/' && active?.length > 0 && (
                  <span className={cx('flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black', isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700')}>
                    {active.length}
                  </span>
                )}
                <ChevronRight className={cx('h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity lg:hidden', isActive && 'opacity-100')} />
              </div>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const brand = (
    <div className="border-b border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3">
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="" className="h-10 w-10 rounded-xl object-contain ring-2 ring-brand-500/20" />
        ) : (
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-900 p-1 shadow-md shadow-brand-600/30 ring-1 ring-slate-200">
            <img src={VORA_LOGO} alt="VORA" className="h-full w-full rounded-lg object-contain" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-black tracking-tight text-slate-900">{name}</p>
          <p className="text-[10px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600">
            V.O.R.A. GAMING OS
          </p>
        </div>
      </div>
    </div>
  )

  const user = (
    <div className="voro-user-box m-3 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="user-name truncate text-xs font-bold text-slate-800">{profile?.full_name || 'Staff'}</p>
            {isAdmin && <Shield className="h-3 w-3 text-[#ff6a3d] shrink-0" />}
          </div>
          <span className="user-role inline-block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{profile?.role}</span>
        </div>
        <button 
          onClick={signOut} 
          title="Sign out" 
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr] pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md lg:flex">
        {brand}
        {navLinks}
        {user}
      </aside>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" />
          <aside 
            className="pop absolute left-0 top-0 flex h-full w-[82vw] max-w-xs flex-col bg-white shadow-2xl z-10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pr-3">
              <div className="flex-1">{brand}</div>
              <button 
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" 
                onClick={() => setOpen(false)} 
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navLinks}
            {user}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3.5 py-2.5 backdrop-blur-md sm:px-6 sm:py-3 lg:px-8">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 active:bg-slate-200 lg:hidden -ml-1" 
              onClick={() => setOpen(true)} 
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-900 p-0.5 lg:hidden">
                <img src={VORA_LOGO} alt="VORA" className="h-full w-full rounded-md object-contain" />
              </div>
              <p className="truncate font-display text-sm font-black text-slate-900 lg:hidden">{name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Light Mode vs Gaming Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
              className={cx(
                'relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all duration-300 border shadow-sm cursor-pointer select-none',
                isGaming 
                  ? 'bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-600/30 border-orange-500/50 text-orange-400 hover:border-orange-400 shadow-[0_0_15px_rgba(255,106,61,0.25)]' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              )}
            >
              {isGaming ? (
                <>
                  <Flame className="h-4 w-4 text-[#ff6a3d] animate-pulse" />
                  <span className="hidden sm:inline font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a3d] via-[#ff8c66] to-[#b0457a]">GAMING MODE</span>
                  <span className="sm:hidden font-extrabold text-[#ff6a3d]">GAME</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline font-bold text-slate-700">LIGHT MODE</span>
                  <span className="sm:hidden font-bold text-slate-700">LIGHT</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SYSTEM</span>
            </div>
            <Button onClick={() => openCheckIn()} size="sm" className="sm:h-9 sm:px-4 sm:text-sm shadow-brand-600/30">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="font-extrabold sm:inline">Start Session</span>
            </Button>
          </div>
        </header>

        {(!online || error) && (
          <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 lg:px-8">
            <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">{!online ? 'Offline mode active. timers count locally.' : `Server message: ${error}`}</span>
          </div>
        )}

        <main className="px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick-Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 py-1.5 backdrop-blur-md lg:hidden">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-0.5 rounded-lg py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/stations" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-0.5 rounded-lg py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Gamepad2 className="h-4 w-4" />
          <span>PS5</span>
        </NavLink>

        <button 
          onClick={() => openCheckIn()}
          className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/40 active:scale-95"
          aria-label="Start new session"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <NavLink 
          to="/simulators" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-0.5 rounded-lg py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Car className="h-4 w-4" />
          <span>Rigs</span>
        </NavLink>

        <NavLink 
          to="/history" 
          className={({ isActive }) => cx(
            'flex flex-col items-center gap-0.5 rounded-lg py-1 px-3 text-[10px] font-bold transition',
            isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </NavLink>
      </div>
    </div>
  )
}
