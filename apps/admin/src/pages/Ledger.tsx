import { DatePicker } from '../DatePicker'
import { useMemo, useState } from 'react'
import { today, useCodes, useLogs, usePurchases } from '../data'
import { ledgerFor, stockOf } from '../stats'
import { Empty, PageHeader } from '../ui'

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
        <div className="card">
          <div className="toolbar">
            <select className="input" value={medicineId} onChange={(e) => setMedicineId(e.target.value)}>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <DatePicker value={from} onChange={(v) => setFrom(v)} />
            <span>~</span>
            <DatePicker value={to} onChange={(v) => setTo(v)} />
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>일자</th><th>구분</th><th>내용</th><th className="num">입고</th><th className="num">출고</th><th className="num">재고</th></tr></thead>
              <tbody>
                <tr><td colSpan={5} className="muted">이월 재고</td><td className="num">{rows.opening}</td></tr>
                {rows.inRange.map((e, i) => (
                  <tr key={i}>
                    <td>{e.date}</td>
                    <td><span className={e.kind === '입고' ? 'badge' : 'badge dark'}>{e.kind}</span></td>
                    <td>{e.note}</td>
                    <td className="num">{e.kind === '입고' ? e.qty : ''}</td>
                    <td className="num">{e.kind === '출고' ? e.qty : ''}</td>
                    <td className="num">{e.balance}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3}>합계</td><td className="num">{totalIn}</td><td className="num">{totalOut}</td><td className="num">{rows.opening + totalIn - totalOut}</td></tr></tfoot>
            </table>
            {!rows.inRange.length && <Empty>해당 기간 입출고 내역이 없습니다.</Empty>}
          </div>
        </div>

        <div className="card">
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
        </div>
      </div>
    </>
  )
}
