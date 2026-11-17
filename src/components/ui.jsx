import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export const cx = (...a) => a.filter(Boolean).join(' ')

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...p }) {
  const v = {
    primary: 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-sm shadow-brand-600/30 hover:shadow-md hover:shadow-brand-600/40 border border-brand-500/20 active:scale-[0.98]',
    soft: 'bg-brand-50/80 text-brand-700 hover:bg-brand-100/90 border border-brand-200/50 active:scale-[0.98]',
    outline: 'border border-slate-200/90 bg-white/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-sm shadow-rose-600/25 active:scale-[0.98]',
    dangerSoft: 'bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-200/60 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-600/25 active:scale-[0.98]',
    cyber: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-sm shadow-cyan-600/25 active:scale-[0.98]',
  }[variant]
  const s = { 
    sm: 'h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-lg', 
    md: 'h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl', 
    lg: 'h-11 px-4 sm:px-5 text-sm font-bold tracking-wide rounded-xl' 
  }[size]
  return (
    <button
      type="button"
      {...p}
      disabled={p.disabled || loading}
      className={cx('inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 cursor-pointer select-none shrink-0', v, s, className)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  )
}

export const Card = ({ className, children, ...p }) => (
  <div {...p} className={cx('rounded-2xl border border-slate-200/70 bg-white/95 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all', className)}>{children}</div>
)

export const inputCls = 'h-10 w-full rounded-xl border border-slate-200/90 bg-white/95 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 transition-all shadow-sm'

export const Input = (p) => <input {...p} className={cx(inputCls, p.className)} />
export const Select = ({ children, ...p }) => <select {...p} className={cx(inputCls, 'pr-8', p.className)}>{children}</select>

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20 border border-emerald-200/60',
  violet: 'bg-brand-50 text-brand-700 ring-brand-500/20 border border-brand-200/60',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-500/20 border border-cyan-200/60',
  amber: 'bg-amber-50 text-amber-700 ring-amber-500/20 border border-amber-200/60',
  slate: 'bg-slate-100 text-slate-700 ring-slate-400/20 border border-slate-200/60',
  rose: 'bg-rose-50 text-rose-700 ring-rose-500/20 border border-rose-200/60',
}
export const Badge = ({ tone = 'slate', children, className }) => (
  <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tight shrink-0', tones[tone], className)}>{children}</span>
)

export function Modal({ title, onClose, children, wide, footer }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={cx('pop flex max-h-[92vh] sm:max-h-[88vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl border border-slate-200/80 sm:rounded-3xl', wide ? 'sm:max-w-2xl lg:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse shrink-0" />
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 overscroll-contain">{children}</div>
        {footer && <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6 sm:py-4 rounded-b-3xl shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-slate-500 font-medium"><Loader2 className="h-5 w-5 animate-spin text-brand-600" />{label}</div>
}

export const Empty = ({ icon: Icon, title, children }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
    {Icon && <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 p-3 text-brand-600 shadow-sm"><Icon className="h-6 w-6" /></div>}
    <p className="font-display text-base font-bold text-slate-800">{title}</p>
    {children && <p className="max-w-sm text-xs leading-relaxed text-slate-500">{children}</p>}
  </div>
)

export const PageHeader = ({ title, sub, children }) => (
  <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 shrink-0" />
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      </div>
      {sub && <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{sub}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">{children}</div>}
  </div>
)

// Simple toast notification system
const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div className="fixed bottom-20 lg:bottom-5 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pop pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold shadow-xl border backdrop-blur-md',
              t.type === 'err'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30'
            )}
          >
            {t.type === 'err' ? <AlertCircle className="h-4 w-4 shrink-0 text-white" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
