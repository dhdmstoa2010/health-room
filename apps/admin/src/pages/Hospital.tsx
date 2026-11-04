import { DatePicker } from '../DatePicker'
import { useState } from 'react'
import { classLabel, today, uid, useClasses, useHospital, type HospitalCare } from '../data'
import { ClassSelect, Empty, Field, Modal, PageHeader } from '../ui'

const blank = (): HospitalCare => ({
  id: uid(), date: today(), grade: 0, classNo: 0, studentName: '', hospital: '', transport: '119', reason: '', action: '',
})

export default function Hospital() {
  const crud = useHospital()
  const classes = useClasses()
  const [editing, setEditing] = useState<HospitalCare | null>(null)
  const patch = (p: Partial<HospitalCare>) => setEditing((e) => (e ? { ...e, ...p } : e))
  const rows = [...crud.items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <PageHeader
        title="병원치료등록"
        desc="병원 이송·치료 내역 등록"
        actions={<button className="btn primary" onClick={() => setEditing(blank())}>+ 병원치료 등록</button>}
      />
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>일자</th><th>학년반</th><th>이름</th><th>병원</th><th>이송</th><th>사유</th><th>조치사항</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{classLabel(r.grade, r.classNo)}</td><td>{r.studentName}</td>
                <td>{r.hospital}</td><td><span className="badge dark">{r.transport}</span></td><td>{r.reason}</td><td>{r.action}</td>
                <td className="actions">
                  <button className="btn sm" onClick={() => setEditing({ ...r })}>수정</button>
                  <button className="btn sm danger" onClick={() => confirm('삭제할까요?') && crud.remove(r.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty>등록된 병원치료 내역이 없습니다.</Empty>}
      </div>

      {editing && (
        <Modal
          title="병원치료 등록"
          onClose={() => setEditing(null)}
          onSubmit={() => {
            if (!editing.grade || !editing.studentName.trim() || !editing.hospital.trim()) return alert('학년반, 이름, 병원은 필수입니다.')
            crud.save(editing)
            setEditing(null)
          }}
        >
          <div className="row">
            <Field label="일자"><DatePicker value={editing.date} onChange={(v) => patch({ date: v })} /></Field>
            <Field label="이송 방법">
              <select className="input" value={editing.transport} onChange={(e) => patch({ transport: e.target.value })}>
                {['119', '보호자', '교직원 동행', '기타'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="row">
            <Field label="학년반"><ClassSelect classes={classes.items} grade={editing.grade} classNo={editing.classNo} onChange={(g, c) => patch({ grade: g, classNo: c })} /></Field>
            <Field label="학생 이름"><input className="input" value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="병원"><input className="input" value={editing.hospital} onChange={(e) => patch({ hospital: e.target.value })} /></Field>
          <Field label="증상 / 사유"><input className="input" value={editing.reason} onChange={(e) => patch({ reason: e.target.value })} /></Field>
          <Field label="조치사항"><textarea className="input" value={editing.action} onChange={(e) => patch({ action: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
