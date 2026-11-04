import { useState } from 'react'
import { uid, useCodes, useLogs, usePurchases, type Code } from '../data'
import { Empty, Field, Modal, PageHeader } from '../ui'

const GROUPS: { key: Code['group']; label: string }[] = [
  { key: 'symptom', label: '증상분류' },
  { key: 'medicine', label: '처치약품' },
]

export default function Codes() {
  const crud = useCodes()
  const logs = useLogs()
  const purchases = usePurchases()
  const [group, setGroup] = useState<Code['group']>('symptom')
  const [editing, setEditing] = useState<Code | null>(null)
  const rows = crud.items.filter((c) => c.group === group)

  const inUse = (id: string) =>
    logs.items.some((l) => l.symptomId === id || l.medicines.some((m) => m.medicineId === id)) || purchases.items.some((p) => p.medicineId === id)

  const remove = (c: Code) => {
    if (inUse(c.id)) return alert('보건일지/구입 내역에서 사용 중인 코드는 삭제할 수 없습니다. 대신 "사용안함"으로 변경하세요.')
    if (confirm(`'${c.name}' 코드를 삭제할까요?`)) crud.remove(c.id)
  }

  return (
    <>
      <PageHeader
        title="공통코드등록"
        desc="증상분류·처치약품 코드 관리"
        actions={<button className="btn primary" onClick={() => setEditing({ id: uid(), group, name: '', active: true })}>+ 코드 등록</button>}
      />
      <div className="toolbar">
        {GROUPS.map((g) => (
          <button key={g.key} className={group === g.key ? 'btn dark' : 'btn'} onClick={() => setGroup(g.key)}>{g.label}</button>
        ))}
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>코드명</th><th>상태</th><th /></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td><span className={c.active ? 'badge' : 'badge gray'}>{c.active ? '사용' : '사용안함'}</span></td>
                <td className="actions">
                  <button className="btn sm" onClick={() => crud.save({ ...c, active: !c.active })}>{c.active ? '사용안함' : '사용'}</button>
                  <button className="btn sm" onClick={() => setEditing({ ...c })}>수정</button>
                  <button className="btn sm danger" onClick={() => remove(c)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty>등록된 코드가 없습니다.</Empty>}
      </div>

      {editing && (
        <Modal
          title={`${GROUPS.find((g) => g.key === editing.group)?.label} 코드`}
          onClose={() => setEditing(null)}
          onSubmit={() => {
            const name = editing.name.trim()
            if (!name) return alert('코드명을 입력하세요.')
            if (crud.items.some((c) => c.id !== editing.id && c.group === editing.group && c.name === name)) return alert('같은 이름의 코드가 있습니다.')
            crud.save({ ...editing, name })
            setEditing(null)
          }}
        >
          <Field label="코드명"><input className="input" autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
