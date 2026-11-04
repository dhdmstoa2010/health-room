import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/date-picker'
import { useMemo, useState } from 'react'
import { classLabel, nameMap, today, useCodes, useLogs, useSettings } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { PageHeader } from '@/components/common/page-header'

export default function LogsPrint() {
  const { items: logs } = useLogs()
  const { items: codes } = useCodes()
  const [settings] = useSettings()
  const names = nameMap(codes)
  const [from, setFrom] = useState(today().slice(0, 8) + '01')
  const [to, setTo] = useState(today())

  const rows = useMemo(
    () => logs.filter((l) => l.date >= from && l.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [logs, from, to],
  )

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

      {!pages.length && <Card><Empty>해당 기간에 출력할 보건일지가 없습니다.</Empty></Card>}
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
              <tr><th style={{ width: 30 }}>번호</th><th>일자</th><th>시간</th><th>학년반</th><th>이름</th><th>증상</th><th>처치 / 약품</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: perPage }, (_, i) => {
                const l = page[i]
                return (
                  <tr key={i}>
                    <td>{idx * perPage + i + 1}</td>
                    <td>{l?.date}</td>
                    <td>{l?.time}</td>
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
