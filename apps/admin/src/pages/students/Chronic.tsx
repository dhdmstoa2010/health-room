import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { classLabel, today, uid, useChronic, useClasses, type Chronic as ChronicT } from '@/lib/data'
import { ClassSelect } from '@/components/common/class-select'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'

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
        actions={<Button variant="default" onClick={() => setEditing(blank())}>+ 요양호자 등록</Button>}
      />
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>학년반</TableHead><TableHead>이름</TableHead><TableHead>증상</TableHead><TableHead>병명</TableHead><TableHead>특이사항</TableHead><TableHead>등록일</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{classLabel(r.grade, r.classNo)}</TableCell><TableCell>{r.studentName}</TableCell><TableCell>{r.symptom}</TableCell>
                <TableCell><Badge>{r.disease}</Badge></TableCell><TableCell>{r.note}</TableCell><TableCell>{r.registeredAt}</TableCell>
                <TableCell className="actions">
                  <Button size="sm" onClick={() => setEditing({ ...r })}>수정</Button>
                  <Button variant="destructive" size="sm" onClick={() => confirm('삭제할까요?') && crud.remove(r.id)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty>등록된 요양호자가 없습니다.</Empty>}
      </Card>

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
            <Field label="학생 이름"><Input value={editing.studentName} onChange={(e) => patch({ studentName: e.target.value })} /></Field>
          </div>
          <Field label="병명"><Input value={editing.disease} onChange={(e) => patch({ disease: e.target.value })} /></Field>
          <Field label="증상"><Input value={editing.symptom} onChange={(e) => patch({ symptom: e.target.value })} /></Field>
          <Field label="특이사항"><Textarea value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
