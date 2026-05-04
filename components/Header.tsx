'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function daysInMonth(month: number) {
  return new Date(2000, month, 0).getDate()
}

interface Props {
  month: number
  day: number
  onDayChange: (month: number, day: number) => void
  photoCount: number
  markedCount: number
  loading: boolean
}

export default function Header({ month, day, onDayChange, photoCount, markedCount, loading }: Props) {
  const maxDay = daysInMonth(month)

  function handleMonth(e: React.ChangeEvent<HTMLSelectElement>) {
    const m = parseInt(e.target.value, 10)
    onDayChange(m, Math.min(day, daysInMonth(m)))
  }

  function handleDay(e: React.ChangeEvent<HTMLSelectElement>) {
    onDayChange(month, parseInt(e.target.value, 10))
  }

  function stepDay(delta: number) {
    let d = day + delta
    let m = month
    if (d < 1) {
      m = m === 1 ? 12 : m - 1
      d = daysInMonth(m)
    } else if (d > daysInMonth(m)) {
      m = m === 12 ? 1 : m + 1
      d = 1
    }
    onDayChange(m, d)
  }

  const selectCls = 'bg-transparent border-none outline-none text-fg font-mono text-sm cursor-pointer'
  const arrowCls = 'w-9 h-9 flex items-center justify-center rounded-lg text-fg hover:bg-white/10 active:bg-white/20 transition-colors shrink-0'

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-border h-16 px-5 flex items-center gap-3 sm:gap-4 overflow-hidden">
      <img src="/favicon.svg" alt="Rewind" className="block sm:hidden w-6 h-6 shrink-0 invert" />
      <div className="hidden sm:block font-display text-xl text-accent shrink-0 leading-none">
        immich <span className="text-muted italic">· rewind</span>
      </div>

      {/* Month + Day selects with arrow stepping */}
      <div className="flex items-center gap-1 bg-surface2 border border-border rounded-xl px-2 py-1.5 shrink-0">
        <button onClick={() => stepDay(-1)} className={arrowCls} title="Previous day">
          <ChevronLeftIcon className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <select value={month} onChange={handleMonth} className={selectCls}>
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <span className="text-muted text-sm font-mono">·</span>
        <select value={day} onChange={handleDay} className={selectCls}>
          {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button onClick={() => stepDay(1)} className={arrowCls} title="Next day">
          <ChevronRightIcon className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Counts */}
      {!loading && photoCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs text-muted bg-surface2 border border-border rounded-full px-3 py-1">
            {photoCount} photo{photoCount !== 1 ? 's' : ''} · all years
          </span>
          {markedCount > 0 && (
            <span className="font-mono text-xs text-danger bg-danger/15 border border-danger/30 rounded-full px-3 py-1">
              {markedCount} marked
            </span>
          )}
        </div>
      )}
    </header>
  )
}
