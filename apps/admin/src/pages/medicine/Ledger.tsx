import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/common/date-picker'
import { useMemo, useState } from 'react'
import { today, useCodes, useLogs, usePurchases } from '@/lib/data'
import { ledgerFor, stockOf } from '@/lib/stats'
import { Empty } from '@/components/common/empty'
import { PageHeader } from '@/components/common/page-header'

export default function Ledger() {
  const { items: codes } = useCodes()
  const { items: logs } = useLogs()
  const { items: purchases } = usePurchases()
  const medicines = codes.filter((c) => c.group === 'medicine')
  const [medicineId, setMedicineId] = useState(medicines[0]?.id ?? '')
  const [from, setFrom] = useState(today().slice(0, 4) + '-01-01')
  const [to, setTo] = useState(today())

  const rows = useMemo(() => {
    const all = ledgerFor(medicineId, logs, purchases)
    const sign = (e: (typeof all)[number]) => (e.kind === '입고' ? e.qty : -e.qty)
    const opening = all.filter((e) => e.date < from).reduce((s, e) => s + sign(e), 0)
    const inRange: ((typeof all)[number] & { balance: number })[] = []
    for (const e of all) {
      if (e.date < from || e.date > to) continue
      inRange.push({ ...e, balance: (inRange.at(-1)?.balance ?? opening) + sign(e) })
    }
    return { opening, inRange }
  }, [medicineId, logs, purchases, from, to])

  const totalIn = rows.inRange.filter((e) => e.kind === '입고').reduce((s, e) => s + e.qty, 0)
  const totalOut = rows.inRange.filter((e) => e.kind === '출고').reduce((s, e) => s + e.qty, 0)

  return (
    <>
      <PageHeader title="약품수불부" desc="약품별 입고·출고 내역" />
      <div className="grid side">
        <Card className="gap-0 p-5">
          <div className="toolbar">
            <NativeSelect value={medicineId} onChange={(e) => setMedicineId(e.target.value)}>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </NativeSelect>
            <DatePicker value={from} onChange={(v) => setFrom(v)} />
            <span>~</span>
            <DatePicker value={to} onChange={(v) => setTo(v)} />
          </div>
          <div className="table-wrap">
            <Table>
              <TableHeader><TableRow><TableHead>일자</TableHead><TableHead>구분</TableHead><TableHead>내용</TableHead><TableHead className="num">입고</TableHead><TableHead className="num">출고</TableHead><TableHead className="num">재고</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell colSpan={5} className="muted">이월 재고</TableCell><TableCell className="num">{rows.opening}</TableCell></TableRow>
                {rows.inRange.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell><Badge variant={e.kind === '입고' ? 'secondary' : 'default'}>{e.kind}</Badge></TableCell>
                    <TableCell>{e.note}</TableCell>
                    <TableCell className="num">{e.kind === '입고' ? e.qty : ''}</TableCell>
                    <TableCell className="num">{e.kind === '출고' ? e.qty : ''}</TableCell>
                    <TableCell className="num">{e.balance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter><TableRow><TableCell colSpan={3}>합계</TableCell><TableCell className="num">{totalIn}</TableCell><TableCell className="num">{totalOut}</TableCell><TableCell className="num">{rows.opening + totalIn - totalOut}</TableCell></TableRow></TableFooter>
            </Table>
            {!rows.inRange.length && <Empty>해당 기간 입출고 내역이 없습니다.</Empty>}
          </div>
        </Card>

        <Card className="gap-0 p-5">
          <h2>현재 재고</h2>
          {medicines.map((m) => {
            const s = stockOf(m.id, logs, purchases)
            return (
              <div className="bar-row" key={m.id} style={{ gridTemplateColumns: '1fr auto' }}>
                <span>{m.name}</span>
                <b style={{ color: s < 0 ? 'var(--danger)' : undefined }}>{s}</b>
              </div>
            )
          })}
        </Card>
      </div>
    </>
  )
}
