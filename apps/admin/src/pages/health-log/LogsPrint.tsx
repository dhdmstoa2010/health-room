import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/search-input'
import { DatePicker } from '@/components/common/date-picker'
import { useEffect, useMemo, useRef, useState } from 'react'
import { classLabel, nameMap, today, useCodes, useLogs, useSettings } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { PageHeader } from '@/components/common/page-header'

const studentKey = (l: { grade: number; classNo: number; studentName: string }) => `${l.grade}-${l.classNo}-${l.studentName}`

export default function LogsPrint() {
  const { items: logs } = useLogs()
  const { items: codes } = useCodes()
  const [settings] = useSettings()
  const names = nameMap(codes)
  const [from, setFrom] = useState(today().slice(0, 8) + '01')
  const [to, setTo] = useState(today())

  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const inRange = useMemo(
    () => logs.filter((l) => l.date >= from && l.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [logs, from, to],
  )

  const students = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number; sort: string }>()
    for (const l of inRange) {
      const key = studentKey(l)
      const cur = map.get(key)
      if (cur) cur.count++
      else map.set(key, { key, label: `${classLabel(l.grade, l.classNo)} ${l.studentName}`, count: 1, sort: `${String(l.grade).padStart(2, '0')}${String(l.classNo).padStart(2, '0')}${l.studentName}` })
    }
    return [...map.values()].sort((a, b) => a.sort.localeCompare(b.sort, 'ko'))
  }, [inRange])

  const shown = students.filter((s) => s.label.includes(query.trim()))
  const selectedCount = students.filter((s) => !excluded.has(s.key)).length
  const rows = useMemo(() => inRange.filter((l) => !excluded.has(studentKey(l))), [inRange, excluded])

  const toggle = (key: string) =>
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  const setMany = (keys: string[], include: boolean) =>
    setExcluded((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => (include ? next.delete(k) : next.add(k)))
      return next
    })

  const perPage = Math.max(1, settings.dailyRows)
  const pages = Array.from({ length: Math.ceil(rows.length / perPage) }, (_, i) => rows.slice(i * perPage, (i + 1) * perPage))

  return (
    <>
      <PageHeader title="보건일지 일괄출력" desc="기간별 보건일지 출력" />
      <div className="toolbar">
        <DatePicker value={from} onChange={(v) => setFrom(v)} />
        <span>~</span>
        <DatePicker value={to} onChange={(v) => setTo(v)} />
        <span className="muted">{rows.length}건 · {pages.length}장</span>
        <span className="spacer" />
        <Button variant="default" disabled={!rows.length} onClick={() => window.print()}>인쇄</Button>
      </div>

      <Card className="no-print mb-4 gap-0 p-4">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <strong>출력 대상 학생</strong>
          <span className="muted">{selectedCount} / {students.length}명 선택</span>
          <span className="spacer" />
          <Button variant="outline" size="sm" onClick={() => setMany(students.map((s) => s.key), true)}>전체 선택</Button>
          <Button variant="outline" size="sm" onClick={() => setMany(students.map((s) => s.key), false)}>전체 해제</Button>
        </div>

        <div ref={boxRef} style={{ position: 'relative', maxWidth: 384 }}>
          <SearchInput
            placeholder="학년반·이름 검색"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          />
          {open && (
            <div style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%', marginTop: 4, maxHeight: 260, overflowY: 'auto', background: 'var(--background, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,.12)' }}>
              {!students.length && <div className="muted" style={{ padding: 12 }}>해당 기간에 보건일지를 쓴 학생이 없습니다.</div>}
              {students.length > 0 && !shown.length && <div className="muted" style={{ padding: 12 }}>검색 결과가 없습니다.</div>}
              {shown.map((s) => (
                <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!excluded.has(s.key)} onChange={() => toggle(s.key)} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span className="muted">{s.count}건</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedCount > 0 && selectedCount < students.length && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {students.filter((s) => !excluded.has(s.key)).map((s) => (
              <button key={s.key} type="button" onClick={() => toggle(s.key)} title="클릭하면 제외" style={{ padding: '3px 10px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 999, cursor: 'pointer' }}>
                {s.label} ✕
              </button>
            ))}
          </div>
        )}
      </Card>

      {!pages.length && <Card className="gap-0 p-5"><Empty>출력할 보건일지가 없습니다. 기간과 학생 선택을 확인해 주세요.</Empty></Card>}
      {pages.map((page, idx) => (
        <div className="sheet" key={idx}>
          <div className="sheet-head">
            <div>
              <h2>보 건 일 지</h2>
              <p className="muted">{from} ~ {to}</p>
            </div>
            <table className="approval">
              <thead><tr>{settings.approvalLine.map((a) => <th key={a}>{a}</th>)}</tr></thead>
              <tbody><tr>{settings.approvalLine.map((a) => <td key={a} />)}</tr></tbody>
            </table>
          </div>
          <table>
            <thead>
              <tr><th style={{ width: 52, whiteSpace: 'nowrap' }}>번호</th><th>일자</th><th>학년반</th><th>이름</th><th>증상</th><th>처치 / 약품</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: perPage }, (_, i) => {
                const l = page[i]
                return (
                  <tr key={i}>
                    <td>{idx * perPage + i + 1}</td>
                    <td>{l?.date}</td>
                    <td>{l && classLabel(l.grade, l.classNo)}</td>
                    <td>{l?.studentName}</td>
                    <td>{l && names[l.symptomId]}</td>
                    <td>{l && [l.treatment, ...l.medicines.map((m) => `${names[m.medicineId] ?? '?'} ${m.qty}`)].filter(Boolean).join(' / ')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="muted" style={{ textAlign: 'center', marginTop: 8 }}>- {idx + 1} / {pages.length} -</p>
        </div>
      ))}
    </>
  )
}
