import { Empty } from './empty'
import { paletteAt } from '@/lib/palette'

export function BarList({ items, colors }: { items: { label: string; value: number }[]; colors?: Record<string, string> }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <Empty />
  return (
    <div>
      {items.map((i, idx) => (
        <div className="bar-row bar-list-row" key={i.label}>
          <span className="bar-label" title={i.label}>{i.label}</span>
          <div className="bar"><i style={{ width: `${(i.value / max) * 100}%`, background: colors?.[i.label] ?? paletteAt(idx) }} /></div>
          <b className="bar-value">{i.value}</b>
        </div>
      ))}
    </div>
  )
}
