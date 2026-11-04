import { DatePicker } from '../DatePicker'
import { useState } from 'react'
import { nameMap, today, uid, useCodes, usePurchases, type Purchase } from '../data'
import { Empty, Field, Modal, PageHeader } from '../ui'

const blank = (): Purchase => ({ id: uid(), date: today(), medicineId: '', qty: 1, note: '' })

export default function Purchases() {
  const crud = usePurchases()
  const { items: codes } = useCodes()
  const names = nameMap(codes)
  const medicines = codes.filter((c) => c.group === 'medicine' && c.active)
  const [editing, setEditing] = useState<Purchase | null>(null)
  const patch = (p: Partial<Purchase>) => setEditing((e) => (e ? { ...e, ...p } : e))
  const rows = [...crud.items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader
        title="약품구입등록"
        desc="약품 구입수량 등록"
        actions={<button className="btn primary" onClick={() => setEditing(blank())}>+ 구입 등록</button>}
      />
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>보건일자</th><th>약품</th><th className="num">구입수량</th><th>비고</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{names[r.medicineId] ?? '-'}</td><td className="num">{r.qty}</td><td>{r.note}</td>
                <td className="actions">
                  <button className="btn sm" onClick={() => setEditing({ ...r })}>수정</button>
                  <button className="btn sm danger" onClick={() => confirm('삭제할까요?') && crud.remove(r.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty>등록된 구입 내역이 없습니다.</Empty>}
      </div>

      {editing && (
        <Modal
          title="약품 구입 등록"
          onClose={() => setEditing(null)}
          onSubmit={() => {
            if (!editing.medicineId || editing.qty < 1) return alert('약품과 1 이상의 수량을 입력하세요.')
            crud.save(editing)
            setEditing(null)
          }}
        >
          <Field label="보건일자"><DatePicker value={editing.date} onChange={(v) => patch({ date: v })} /></Field>
          <Field label="약품" hint="목록에 없는 약품은 공통코드등록에서 먼저 추가하세요.">
            <select className="input" value={editing.medicineId} onChange={(e) => patch({ medicineId: e.target.value })}>
              <option value="">선택</option>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="구입수량"><input type="number" min={1} className="input" value={editing.qty} onChange={(e) => patch({ qty: Number(e.target.value) })} /></Field>
          <Field label="비고"><input className="input" value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
