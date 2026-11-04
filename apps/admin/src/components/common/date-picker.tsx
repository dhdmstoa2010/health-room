import { useEffect, useRef, useState } from 'react'
import { dateStr, pad, today } from '@/lib/data'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

function parse(v: string): { y: number; m: number } {
  const d = v ? new Date(v + 'T00:00:00') : new Date()
  return { y: d.getFullYear(), m: d.getMonth() }
}

export function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => parse(value))
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 })
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)

  const show = () => {
    const r = btn.current!.getBoundingClientRect()
    const height = 330
    const top = r.bottom + 6 + height > window.innerHeight ? Math.max(8, r.top - height - 6) : r.bottom + 6
    setPos({ left: Math.min(r.left, window.innerWidth - 292), top })
    setView(parse(value))
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e: MouseEvent) => {
      if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  const move = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  const first = new Date(view.y, view.m, 1).getDay()
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const cells = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const pick = (v: string) => { onChange(v); setOpen(false) }

  return (
    <>
      <button type="button" ref={btn} className="input datepicker-btn" onClick={() => (open ? setOpen(false) : show())}>
        <span>{value || '날짜 선택'}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>
      {open && (
        <div className="dp-pop" ref={pop} style={{ left: pos.left, top: pos.top }}>
          <div className="dp-head">
            <button type="button" onClick={() => move(-1)} aria-label="이전 달">‹</button>
            <b>{view.y}년 {view.m + 1}월</b>
            <button type="button" onClick={() => move(1)} aria-label="다음 달">›</button>
          </div>
          <div className="dp-grid">
            {DOW.map((d, i) => <span key={d} className={`dp-dow ${i === 0 ? 'sun' : ''}`}>{d}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={i} />
              const ds = `${view.y}-${pad(view.m + 1)}-${pad(d)}`
              const cls = ['dp-day', ds === value && 'sel', ds === today() && 'today', (i % 7) === 0 && 'sun'].filter(Boolean).join(' ')
              return <button type="button" key={i} className={cls} onClick={() => pick(ds)}>{d}</button>
            })}
          </div>
          <div className="dp-foot">
            <button type="button" onClick={() => pick(dateStr(new Date()))}>오늘</button>
            <button type="button" onClick={() => setOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </>
  )
}
