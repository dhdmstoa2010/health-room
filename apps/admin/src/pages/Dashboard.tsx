import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { dateStr, nameMap, today, useChronic, useCodes, useLogs, usePurchases, useSchedules } from '@/lib/data'
import { countBy, stockOf } from '@/lib/stats'
import { BarList } from '@/components/common/bar-list'
import { Empty } from '@/components/common/empty'
import { PageHeader } from '@/components/common/page-header'

const RANGES = [7, 14, 30] as const

function DailyChart({ days }: { days: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 800
  const H = 240
  const pad4 = { l: 32, r: 8, t: 20, b: 28 }
  const max = Math.max(4, ...days.map((d) => d.count))
  const top = Math.ceil(max / 2) * 2
  const innerW = W - pad4.l - pad4.r
  const innerH = H - pad4.t - pad4.b
  const slot = innerW / days.length
  const barW = Math.min(36, slot * 0.6)
  const labelEvery = days.length > 14 ? 3 : 1
  const ticks = [0, top / 2, top]
  const t = today()

  return (
    <div>
      <div className="chart-readout">
        {hover !== null
          ? <><b>{days[hover].date}</b> · 방문 <b>{days[hover].count}명</b></>
          : <span className="muted">막대에 마우스를 올리면 일별 방문 수를 볼 수 있습니다.</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="일별 방문 학생 수 그래프" onMouseLeave={() => setHover(null)}>
        {ticks.map((v) => {
          const y = pad4.t + innerH - (v / top) * innerH
          return (
            <g key={v}>
              <line x1={pad4.l} x2={W - pad4.r} y1={y} y2={y} stroke="#e8ecf1" />
              <text x={pad4.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{v}</text>
            </g>
          )
        })}
        {days.map((d, i) => {
          const h = (d.count / top) * innerH
          const x = pad4.l + slot * i + (slot - barW) / 2
          const y = pad4.t + innerH - h
          const isToday = d.date === t
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={pad4.l + slot * i} y={pad4.t} width={slot} height={innerH} fill="transparent" />
              <rect x={x} y={y} width={barW} height={Math.max(h, d.count ? 2 : 0)} rx={3}
                fill={isToday ? '#0f172a' : '#2e7d32'} opacity={hover === null || hover === i ? 1 : 0.45} />
              {days.length <= 14 && d.count > 0 && (
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111">{d.count}</text>
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={isToday ? '#111' : '#707570'} fontWeight={isToday ? 700 : 400}>
                  {d.date.slice(5).replace('-', '/')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const { items: logs } = useLogs()
  const { items: codes } = useCodes()
  const { items: purchases } = usePurchases()
  const { items: schedules } = useSchedules()
  const chronic = useChronic()
  const names = nameMap(codes)
  const [range, setRange] = useState<(typeof RANGES)[number]>(14)

  const t = today()
  const month = t.slice(0, 7)

  const days = useMemo(() => {
    const byDate = countBy(logs, (l) => l.date)
    return Array.from({ length: range }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (range - 1 - i))
      const date = dateStr(d)
      return { date, count: byDate[date] ?? 0 }
    })
  }, [logs, range])

  const todayCount = days.at(-1)?.count ?? 0
  const yesterday = days.at(-2)?.count ?? 0
  const diff = todayCount - yesterday
  const total = days.reduce((s, d) => s + d.count, 0)
  const avg = total / days.length
  const peak = days.reduce((a, b) => (b.count > a.count ? b : a), days[0])

  const monthLogs = logs.filter((l) => l.date.startsWith(month))
  const symptoms = Object.entries(countBy(monthLogs, (l) => names[l.symptomId] ?? '미분류'))
    .map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  const grades = Object.entries(countBy(monthLogs, (l) => `${l.grade}학년`))
    .map(([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label))
  const low = codes.filter((c) => c.group === 'medicine' && c.active).map((c) => ({ ...c, stock: stockOf(c.id, logs, purchases) })).filter((c) => c.stock <= 5)
  const upcoming = schedules.filter((s) => s.date >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  return (
    <>
      <PageHeader title="대시보드" desc={t} />
      <div className="grid cols-4">
        <div className="stat">
          <span>오늘 방문</span><strong>{todayCount}</strong>
          <span>{diff === 0 ? '어제와 같음' : diff > 0 ? `어제보다 ${diff}명 ↑` : `어제보다 ${-diff}명 ↓`}</span>
        </div>
        <div className="stat"><span>이번 달 방문</span><strong>{monthLogs.length}</strong></div>
        <div className="stat"><span>요양호자</span><strong>{chronic.items.length}</strong></div>
        <div className="stat"><span>재고 부족 약품</span><strong>{low.length}</strong></div>
      </div>

      <Card  style={{ marginTop: 16 }}>
        <div className="toolbar" style={{ marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>일별 방문 학생 수</h2>
          <span className="spacer" />
          {RANGES.map((r) => (
            <Button key={r} size="sm" variant={range === r ? 'default' : 'outline'} onClick={() => setRange(r)}>최근 {r}일</Button>
          ))}
        </div>
        <DailyChart days={days} />
        <div className="chart-summary">
          <div><span>기간 합계</span><b>{total}명</b></div>
          <div><span>일평균</span><b>{avg.toFixed(1)}명</b></div>
          <div><span>최다 방문일</span><b>{peak.count ? `${peak.date.slice(5).replace('-', '/')} (${peak.count}명)` : '-'}</b></div>
        </div>
      </Card>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <Card><h2>이번 달 증상 Top 5</h2><BarList items={symptoms} /></Card>
        <Card><h2>이번 달 학년별 방문</h2><BarList items={grades} /></Card>
        <Card>
          <h2>재고 부족 (5 이하)</h2>
          {low.map((c) => <div className="bar-row" key={c.id} style={{ gridTemplateColumns: '1fr auto' }}><span>{c.name}</span><b>{c.stock}</b></div>)}
          {!low.length && <Empty>재고 부족 약품이 없습니다.</Empty>}
        </Card>
        <Card>
          <h2>다가오는 일정</h2>
          {upcoming.map((s) => <div key={s.id} style={{ padding: '6px 0' }}><Badge>{s.category}</Badge> {s.title} <span className="muted">{s.date.slice(5)} {s.time}</span></div>)}
          {!upcoming.length && <Empty>예정된 일정이 없습니다.</Empty>}
        </Card>
      </div>
    </>
  )
}
