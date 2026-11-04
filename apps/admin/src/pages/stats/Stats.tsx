import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import { useMemo, useState } from 'react'
import { classLabel, nameMap, useClasses, useCodes, useLogs, useSettings } from '@/lib/data'
import { academicMonths, currentAcademicYear } from '@/lib/stats'
import { PageHeader } from '@/components/common/page-header'

function YearPicker({ year, setYear, resetMonth }: { year: number; setYear: (y: number) => void; resetMonth: number }) {
  const base = currentAcademicYear(resetMonth)
  return (
    <NativeSelect value={year} onChange={(e) => setYear(Number(e.target.value))}>
      {[0, 1, 2, 3, 4].map((i) => (
        <option key={i} value={base - i}>{base - i}학년도 ({resetMonth}월 ~ {resetMonth === 1 ? 12 : resetMonth - 1}월)</option>
      ))}
    </NativeSelect>
  )
}

type Matrix = { rows: { label: string; cells: number[]; total: number }[]; totals: number[]; grand: number }

function MatrixTable({ labels, matrix, head }: { labels: string[]; matrix: Matrix; head: string }) {
  return (
    <Card className="gap-0 p-5 overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>{head}</TableHead>{labels.map((l) => <TableHead key={l} className="num">{l}</TableHead>)}<TableHead className="num">합계</TableHead></TableRow></TableHeader>
        <TableBody>
          {matrix.rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell>{r.label}</TableCell>
              {r.cells.map((c, i) => <TableCell key={i} className="num" style={c ? undefined : { color: 'var(--gray-300)' }}>{c}</TableCell>)}
              <TableCell className="num"><b>{r.total}</b></TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter><TableRow><TableCell>합계</TableCell>{matrix.totals.map((c, i) => <TableCell key={i} className="num">{c}</TableCell>)}<TableCell className="num">{matrix.grand}</TableCell></TableRow></TableFooter>
      </Table>
    </Card>
  )
}

function buildMatrix(rowKeys: { key: string; label: string }[], monthKeys: string[], hits: { row: string; month: string }[]): Matrix {
  const rows = rowKeys.map((r) => {
    const cells = monthKeys.map((m) => hits.filter((h) => h.row === r.key && h.month === m).length)
    return { label: r.label, cells, total: cells.reduce((a, b) => a + b, 0) }
  })
  const totals = monthKeys.map((_, i) => rows.reduce((s, r) => s + r.cells[i], 0))
  return { rows, totals, grand: totals.reduce((a, b) => a + b, 0) }
}

export function StatsByClass() {
  const { items: logs } = useLogs()
  const { items: classes } = useClasses()
  const [settings] = useSettings()
  const [year, setYear] = useState(currentAcademicYear(settings.statsResetMonth))
  const [mode, setMode] = useState<'class' | 'grade'>('class')
  const months = academicMonths(year, settings.statsResetMonth)

  const matrix = useMemo(() => {
    const keys = months.map((m) => m.key)
    const sorted = [...classes].sort((a, b) => a.grade - b.grade || a.classNo - b.classNo)
    const rowKeys =
      mode === 'class'
        ? sorted.map((c) => ({ key: `${c.grade}-${c.classNo}`, label: classLabel(c.grade, c.classNo) }))
        : [...new Set(sorted.map((c) => c.grade))].map((g) => ({ key: String(g), label: `${g}학년` }))
    const hits = logs.map((l) => ({ row: mode === 'class' ? `${l.grade}-${l.classNo}` : String(l.grade), month: l.date.slice(0, 7) }))
    return buildMatrix(rowKeys, keys, hits)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, classes, mode, year, settings.statsResetMonth])

  return (
    <>
      <PageHeader title="학년반통계" desc="학년반별 월간 이용 건수" />
      <div className="toolbar">
        <YearPicker year={year} setYear={setYear} resetMonth={settings.statsResetMonth} />
        <NativeSelect value={mode} onChange={(e) => setMode(e.target.value as 'class' | 'grade')}>
          <option value="class">학년반별</option>
          <option value="grade">학년별</option>
        </NativeSelect>
      </div>
      <MatrixTable head={mode === 'class' ? '학년반' : '학년'} labels={months.map((m) => m.label)} matrix={matrix} />
    </>
  )
}

export function StatsBySymptom() {
  const { items: logs } = useLogs()
  const { items: codes } = useCodes()
  const [settings] = useSettings()
  const [year, setYear] = useState(currentAcademicYear(settings.statsResetMonth))
  const months = academicMonths(year, settings.statsResetMonth)
  const names = nameMap(codes)

  const matrix = useMemo(() => {
    const rowKeys = codes.filter((c) => c.group === 'symptom').map((c) => ({ key: c.id, label: c.name }))
    return buildMatrix(rowKeys, months.map((m) => m.key), logs.map((l) => ({ row: l.symptomId, month: l.date.slice(0, 7) })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, codes, year, settings.statsResetMonth, names])

  return (
    <>
      <PageHeader title="증상분류통계" desc="증상별 월간 방문 건수" />
      <div className="toolbar"><YearPicker year={year} setYear={setYear} resetMonth={settings.statsResetMonth} /></div>
      <MatrixTable head="증상분류" labels={months.map((m) => m.label)} matrix={matrix} />
    </>
  )
}
