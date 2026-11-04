import { Empty } from './empty'

export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <Empty />
  return (
    <div>
      {items.map((i) => (
        <div className="bar-row" key={i.label}>
          <span>{i.label}</span>
          <div className="bar"><i style={{ width: `${(i.value / max) * 100}%` }} /></div>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  )
}
