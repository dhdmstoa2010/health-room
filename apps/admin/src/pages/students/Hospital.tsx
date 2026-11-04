import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input, NativeSelect, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/date-picker'
import { useState } from 'react'
import { classLabel, today, uid, useClasses, useHospital, type HospitalCare } from '@/lib/data'
import { ClassSelect } from '@/components/common/class-select'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'

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
        actions={<Button variant="default" onClick={() => setEditing(blank())}>+ 병원치료 등록</Button>}
      />
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>일자</TableHead><TableHead>학년반</TableHead><TableHead>이름</TableHead><TableHead>병원</TableHead><TableHead>이송</TableHead><TableHead>사유</TableHead><TableHead>조치사항</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell><TableCell>{classLabel(r.grade, r.classNo)}</TableCell><TableCell>{r.studentName}</TableCell>
                <TableCell>{r.hospital}</TableCell><TableCell><Badge variant="default">{r.transport}</Badge></TableCell><TableCell>{r.reason}</TableCell><TableCell>{r.action}</TableCell>
                <TableCell className="actions">
                  <Button size="sm" onClick={() => setEditing({ ...r })}>수정</Button>
                  <Button variant="destructive" size="sm" onClick={() => confirm('삭제할까요?') && crud.remove(r.id)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty>등록된 병원치료 내역이 없습니다.</Empty>}
      </Card>

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
              <NativeSelect value={editing.transport} onChange={(e) => patch({ transport: e.target.value })}>
                {['119', '보호자', '교직원 동행', '기타'].map((t) => <option key={t}>{t}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <div className="row">
            <Field label="학년반"><ClassSelect classes={classes.items} grade={editing.grade} classNo={editing.classNo} onChange={(g, c) => patch({ grade: g, classNo: c })} /></Field>
            <Field label="학생 이름"><Input value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="병원"><Input value={editing.hospital} onChange={(e) => patch({ hospital: e.target.value })} /></Field>
          <Field label="증상 / 사유"><Input value={editing.reason} onChange={(e) => patch({ reason: e.target.value })} /></Field>
          <Field label="조치사항"><Textarea value={editing.action} onChange={(e) => patch({ action: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
