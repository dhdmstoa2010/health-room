import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/date-picker'
import { useMemo, useState } from 'react'
import {
  classLabel, nameMap, today, uid, useClasses, useCodes, useLogs, type HealthLog,
} from '@/lib/data'
import { BarList } from '@/components/common/bar-list'
import { ClassSelect } from '@/components/common/class-select'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'
import { countBy } from '@/lib/stats'

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
        actions={<Button variant="default" onClick={openNew}>+ 보건일지 등록</Button>}
      />

      <div className="grid side">
        <Card className="gap-0 p-5">
          <div className="toolbar">
            <DatePicker value={from} onChange={(v) => setFrom(v)} />
            <span>~</span>
            <DatePicker value={to} onChange={(v) => setTo(v)} />
            <Input placeholder="학생 이름 / 처치 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <span className="spacer" />
            <span className="muted">총 {rows.length}건</span>
          </div>
          <div className="table-wrap">
            <Table>
              <TableHeader>
                <TableRow><TableHead>일자</TableHead><TableHead>시간</TableHead><TableHead>학년반</TableHead><TableHead>이름</TableHead><TableHead>증상분류</TableHead><TableHead>처치 / 약품</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.date}</TableCell>
                    <TableCell>{l.time}</TableCell>
                    <TableCell>{classLabel(l.grade, l.classNo)}</TableCell>
                    <TableCell>{l.studentName}</TableCell>
                    <TableCell><Badge variant="secondary">{names[l.symptomId] ?? '-'}</Badge></TableCell>
                    <TableCell>
                      {l.treatment}
                      {l.medicines.length > 0 && (
                        <div className="muted">{l.medicines.map((m) => `${names[m.medicineId] ?? '?'} ${m.qty}`).join(', ')}</div>
                      )}
                    </TableCell>
                    <TableCell className="actions">
                      <Button variant="outline" size="sm" onClick={() => openEdit(l)}>수정</Button>
                      <Button variant="outline" size="sm" onClick={() => setMoving({ log: l, date: l.date })}>일자변경</Button>
                      <Button variant="outline" className="text-destructive" size="sm" onClick={() => confirm('이 보건일지를 삭제할까요?') && logs.remove(l.id)}>삭제</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!rows.length && <Empty>조회된 보건일지가 없습니다.</Empty>}
          </div>
        </Card>

        <div>
          <Card className="gap-0 p-5">
            <h2>증상분류 통계</h2>
            <BarList items={stats.symptom} />
          </Card>
          <Card className="gap-0 p-5">
            <h2>약품 사용(출고)</h2>
            <BarList items={stats.medicine} />
            <Button variant="outline" size="sm" style={{ marginTop: 12 }} onClick={() => setStatTick((t) => t + 1)}>통계 재계산</Button>
          </Card>
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
            <Field label="학생 이름"><Input value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="증상분류">
            <NativeSelect value={editing.symptomId} onChange={(e) => patch({ symptomId: e.target.value })}>
              <option value="">선택</option>
              {symptoms.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="처치 내용">
            <Textarea value={editing.treatment} onChange={(e) => patch({ treatment: e.target.value })} />
          </Field>
          <Field label="처치 약품">
            {editing.medicines.map((m, i) => (
              <div className="row" key={i} style={{ marginBottom: 6 }}>
                <NativeSelect value={m.medicineId} onChange={(e) => patch({ medicines: editing.medicines.map((x, j) => (j === i ? { ...x, medicineId: e.target.value } : x)) })}>
                  <option value="">약품 선택</option>
                  {medicines.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
                <input type="number" min={1} className="input" value={m.qty} onChange={(e) => patch({ medicines: editing.medicines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)) })} />
                <Button variant="outline" type="button" size="sm" style={{ flex: '0 0 auto' }} onClick={() => patch({ medicines: editing.medicines.filter((_, j) => j !== i) })}>삭제</Button>
              </div>
            ))}
            <div><Button variant="outline" type="button" size="sm" onClick={() => patch({ medicines: [...editing.medicines, { medicineId: '', qty: 1 }] })}>+ 약품 추가</Button></div>
          </Field>
          <Field label="비고"><Input value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
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
