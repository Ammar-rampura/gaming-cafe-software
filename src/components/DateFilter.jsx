import { Input, cx } from './ui'
import { PRESETS } from '../lib/dates'

export default function DateFilter({ preset, setPreset, from, setFrom, to, setTo }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex overflow-x-auto no-scrollbar gap-1 rounded-xl bg-slate-100 p-1 shrink-0">
        {PRESETS.map(([v, l]) => (
          <button 
            key={v} 
            onClick={() => setPreset(v)} 
            className={cx(
              'rounded-lg px-2.5 py-1.5 text-xs font-bold transition whitespace-nowrap', 
              preset === v 
                ? 'bg-white text-brand-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {l}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            type="date" 
            value={from} 
            onChange={(e) => setFrom(e.target.value)} 
            className="flex-1 sm:w-36 text-xs" 
            aria-label="From date" 
          />
          <span className="text-xs text-slate-400 font-bold">to</span>
          <Input 
            type="date" 
            value={to} 
            onChange={(e) => setTo(e.target.value)} 
            className="flex-1 sm:w-36 text-xs" 
            aria-label="To date" 
          />
        </div>
      )}
    </div>
  )
}
