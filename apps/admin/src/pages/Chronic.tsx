import { useState } from 'react'
import { classLabel, today, uid, useChronic, useClasses, type Chronic as ChronicT } from '../data'
import { ClassSelect, Empty, Field, Modal, PageHeader } from '../ui'

const blank = (): ChronicT => ({
  id: uid(), grade: 0, classNo: 0, studentName: '', symptom: '', disease: '', note: '', registeredAt: today(),
})

export default function Chronic() {
  const crud = useChronic()
  const classes = useClasses()
  const [editing, setEditing] = useState<ChronicT | null>(null)
  const patch = (p: Partial<ChronicT>) => setEditing((e) => (e ? { ...e, ...p } : e))
  const rows = [...crud.items].sort((a, b) => a.grade - b.grade || a.classNo - b.classNo)

  return (
    <>
      <PageHeader
        title="요양호자등록"
        desc="지속 관리 대상 학생 등록"
        actions={<button className="btn primary" onClick={() => setEditing(blank())}>+ 요양호자 등록</button>}
      />
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>학년반</th><th>이름</th><th>증상</th><th>병명</th><th>특이사항</th><th>등록일</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{classLabel(r.grade, r.classNo)}</td><td>{r.studentName}</td><td>{r.symptom}</td>
                <td><span className="badge">{r.disease}</span></td><td>{r.note}</td><td>{r.registeredAt}</td>
                <td className="actions">
                  <button className="btn sm" onClick={() => setEditing({ ...r })}>수정</button>
                  <button className="btn sm danger" onClick={() => confirm('삭제할까요?') && crud.remove(r.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty>등록된 요양호자가 없습니다.</Empty>}
      </div>

      {editing && (
        <Modal
          title="요양호자 등록"
          onClose={() => setEditing(null)}
          onSubmit={() => {
            if (!editing.grade || !editing.studentName.trim() || !editing.disease.trim()) return alert('학년반, 이름, 병명은 필수입니다.')
            crud.save(editing)
            setEditing(null)
          }}
        >
          <div className="row">
            <Field label="학년반"><ClassSelect classes={classes.items} grade={editing.grade} classNo={editing.classNo} onChange={(g, c) => patch({ grade: g, classNo: c })} /></Field>
            <Field label="학생 이름"><input className="input" value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="병명"><input className="input" value={editing.disease} onChange={(e) => patch({ disease: e.target.value })} /></Field>
          <Field label="증상"><input className="input" value={editing.symptom} onChange={(e) => patch({ symptom: e.target.value })} /></Field>
          <Field label="특이사항"><textarea className="input" value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
