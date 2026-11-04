import { DatePicker } from '../DatePicker'
import { useMemo, useState } from 'react'
import {
  classLabel, nameMap, today, uid, useClasses, useCodes, useLogs, type HealthLog,
} from '../data'
import { BarList, ClassSelect, Empty, Field, Modal, PageHeader } from '../ui'
import { countBy } from '../stats'

const monthStart = () => today().slice(0, 8) + '01'

const blank = (): HealthLog => ({
  id: uid(), date: today(), time: new Date().toTimeString().slice(0, 5), grade: 0, classNo: 0,
  studentName: '', symptomId: '', treatment: '', medicines: [], note: '',
})

export default function HealthLogs() {
  const logs = useLogs()
  const { items: codes } = useCodes()
  const { items: classes } = useClasses()
  const names = nameMap(codes)
  const symptoms = codes.filter((c) => c.group === 'symptom' && c.active)
  const medicines = codes.filter((c) => c.group === 'medicine' && c.active)

  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<HealthLog | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [moving, setMoving] = useState<{ log: HealthLog; date: string } | null>(null)

  const rows = useMemo(
    () =>
      logs.items
        .filter((l) => l.date >= from && l.date <= to)
        .filter((l) => !keyword || l.studentName.includes(keyword) || l.treatment.includes(keyword))
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)),
    [logs.items, from, to, keyword],
  )

  // 약품 수불 / 증상 분류 통계 (조회된 보건일지 기준)
  const [statTick, setStatTick] = useState(0)
  const stats = useMemo(() => {
    void statTick
    const symptom = Object.entries(countBy(rows, (r) => names[r.symptomId] ?? '미분류'))
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
    const used: Record<string, number> = {}
    for (const r of rows) for (const m of r.medicines) used[m.medicineId] = (used[m.medicineId] ?? 0) + m.qty
    const medicine = Object.entries(used).map(([id, value]) => ({ label: names[id] ?? id, value })).sort((a, b) => b.value - a.value)
    return { symptom, medicine }
  }, [rows, names, statTick])

  const openNew = () => { setEditing(blank()); setIsNew(true) }
  const openEdit = (l: HealthLog) => { setEditing(structuredClone(l)); setIsNew(false) }

  const submit = () => {
    if (!editing) return
    if (!editing.grade || !editing.studentName.trim() || !editing.symptomId) {
      alert('학년반, 학생 이름, 증상분류는 필수입니다.')
      return
    }
    logs.save({ ...editing, studentName: editing.studentName.trim(), medicines: editing.medicines.filter((m) => m.medicineId && m.qty > 0) })
    setEditing(null)
  }

  const patch = (p: Partial<HealthLog>) => setEditing((e) => (e ? { ...e, ...p } : e))

  return (
    <>
      <PageHeader
        title="보건일지"
        desc="방문 학생의 증상·처치 내역 관리"
        actions={<button className="btn primary" onClick={openNew}>+ 보건일지 등록</button>}
      />

      <div className="grid side">
        <div className="card">
          <div className="toolbar">
            <DatePicker value={from} onChange={(v) => setFrom(v)} />
            <span>~</span>
            <DatePicker value={to} onChange={(v) => setTo(v)} />
            <input className="input" placeholder="학생 이름 / 처치 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <span className="spacer" />
            <span className="muted">총 {rows.length}건</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>일자</th><th>시간</th><th>학년반</th><th>이름</th><th>증상분류</th><th>처치 / 약품</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{l.time}</td>
                    <td>{classLabel(l.grade, l.classNo)}</td>
                    <td>{l.studentName}</td>
                    <td><span className="badge">{names[l.symptomId] ?? '-'}</span></td>
                    <td>
                      {l.treatment}
                      {l.medicines.length > 0 && (
                        <div className="muted">{l.medicines.map((m) => `${names[m.medicineId] ?? '?'} ${m.qty}`).join(', ')}</div>
                      )}
                    </td>
                    <td className="actions">
                      <button className="btn sm" onClick={() => openEdit(l)}>수정</button>
                      <button className="btn sm" onClick={() => setMoving({ log: l, date: l.date })}>일자변경</button>
                      <button className="btn sm danger" onClick={() => confirm('이 보건일지를 삭제할까요?') && logs.remove(l.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>조회된 보건일지가 없습니다.</Empty>}
          </div>
        </div>

        <div>
          <div className="card">
            <h2>증상분류 통계</h2>
            <BarList items={stats.symptom} />
          </div>
          <div className="card">
            <h2>약품 사용(출고)</h2>
            <BarList items={stats.medicine} />
            <button className="btn sm" style={{ marginTop: 12 }} onClick={() => setStatTick((t) => t + 1)}>통계 재계산</button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal title={isNew ? '보건일지 등록' : '보건일지 수정'} onClose={() => setEditing(null)} onSubmit={submit}>
          <div className="row">
            <Field label="일자"><DatePicker value={editing.date} onChange={(v) => patch({ date: v })} /></Field>
            <Field label="시간"><input type="time" className="input" value={editing.time} onChange={(e) => patch({ time: e.target.value })} /></Field>
          </div>
          <div className="row">
            <Field label="학년반">
              <ClassSelect classes={classes} grade={editing.grade} classNo={editing.classNo} onChange={(g, c) => patch({ grade: g, classNo: c })} />
            </Field>
            <Field label="학생 이름"><input className="input" value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="증상분류">
            <select className="input" value={editing.symptomId} onChange={(e) => patch({ symptomId: e.target.value })}>
              <option value="">선택</option>
              {symptoms.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="처치 내용">
            <textarea className="input" value={editing.treatment} onChange={(e) => patch({ treatment: e.target.value })} />
          </Field>
          <Field label="처치 약품">
            {editing.medicines.map((m, i) => (
              <div className="row" key={i} style={{ marginBottom: 6 }}>
                <select className="input" value={m.medicineId} onChange={(e) => patch({ medicines: editing.medicines.map((x, j) => (j === i ? { ...x, medicineId: e.target.value } : x)) })}>
                  <option value="">약품 선택</option>
                  {medicines.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" min={1} className="input" value={m.qty} onChange={(e) => patch({ medicines: editing.medicines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)) })} />
                <button type="button" className="btn sm" style={{ flex: '0 0 auto' }} onClick={() => patch({ medicines: editing.medicines.filter((_, j) => j !== i) })}>삭제</button>
              </div>
            ))}
            <div><button type="button" className="btn sm" onClick={() => patch({ medicines: [...editing.medicines, { medicineId: '', qty: 1 }] })}>+ 약품 추가</button></div>
          </Field>
          <Field label="비고"><input className="input" value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
        </Modal>
      )}

      {moving && (
        <Modal
          title="보건일지 일자변경"
          onClose={() => setMoving(null)}
          submitLabel="변경"
          onSubmit={() => {
            if (!moving.date) return
            logs.save({ ...moving.log, date: moving.date })
            setMoving(null)
          }}
        >
          <p className="muted" style={{ marginBottom: 12 }}>{moving.log.studentName} · {names[moving.log.symptomId]} · 현재 {moving.log.date}</p>
          <Field label="변경할 일자">
            <DatePicker value={moving.date} onChange={(v) => setMoving({ ...moving, date: v })} />
          </Field>
        </Modal>
      )}
    </>
  )
}
