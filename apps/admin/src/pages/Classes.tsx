import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { readSheet } from 'read-excel-file/browser'
import { classLabel, uid, useClasses, type ClassInfo } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'

export default function Classes() {
  const crud = useClasses()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<ClassInfo | null>(null)
  const [message, setMessage] = useState('')
  const rows = [...crud.items].sort((a, b) => a.grade - b.grade || a.classNo - b.classNo)

  const save = () => {
    if (!editing) return
    if (!(editing.grade > 0) || !(editing.classNo > 0)) return alert('학년과 반은 1 이상의 숫자여야 합니다.')
    if (crud.items.some((c) => c.id !== editing.id && c.grade === editing.grade && c.classNo === editing.classNo)) {
      return alert('이미 등록된 학년반입니다.')
    }
    crud.save(editing)
    setEditing(null)
  }

  const upload = async (file: File) => {
    try {
      const data = await readSheet(file)
      const parsed: ClassInfo[] = []
      for (const row of data.slice(1)) {
        const grade = Number(row[0])
        const classNo = Number(row[1])
        if (!(grade > 0) || !(classNo > 0)) continue
        parsed.push({ id: uid(), grade, classNo, teacher: row[2] ? String(row[2]) : '' })
      }
      if (!parsed.length) return setMessage('등록할 행이 없습니다. 첫 행은 제목(학년, 반, 담임), 이후 행부터 데이터여야 합니다.')
      crud.setItems((prev) => {
        const next = [...prev]
        for (const p of parsed) {
          const i = next.findIndex((c) => c.grade === p.grade && c.classNo === p.classNo)
          if (i >= 0) next[i] = { ...next[i], teacher: p.teacher || next[i].teacher }
          else next.push(p)
        }
        return next
      })
      setMessage(`${parsed.length}건을 일괄 등록했습니다. (이미 있는 학년반은 담임만 갱신)`)
    } catch {
      setMessage('엑셀 파일(.xlsx)을 읽지 못했습니다. 형식을 확인해 주세요.')
    }
  }

  return (
    <>
      <PageHeader
        title="학년반등록"
        desc="학년·반 정보 관리"
        actions={
          <>
            <input ref={fileRef} type="file" accept=".xlsx" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = '' }} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>엑셀 업로드</Button>{' '}
            <Button variant="default" onClick={() => setEditing({ id: uid(), grade: 1, classNo: 1, teacher: '' })}>+ 학년반 등록</Button>
          </>
        }
      />
      {message && <Card  style={{ marginBottom: 16 }}>{message}</Card>}
      <p className="muted" style={{ marginBottom: 8 }}>엑셀 양식(.xlsx): 1행 제목 / A열 학년 · B열 반 · C열 담임(선택)</p>
      <Card className="gap-0 p-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>학년반</TableHead><TableHead>담임</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{classLabel(c.grade, c.classNo)}</TableCell><TableCell>{c.teacher}</TableCell>
                <TableCell className="actions">
                  <Button variant="outline" size="sm" onClick={() => setEditing({ ...c })}>수정</Button>
                  <Button variant="outline" className="text-destructive" size="sm" onClick={() => confirm('삭제할까요?') && crud.remove(c.id)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty>등록된 학년반이 없습니다.</Empty>}
      </Card>

      {editing && (
        <Modal title="학년반" onClose={() => setEditing(null)} onSubmit={save}>
          <div className="row">
            <Field label="학년"><input type="number" min={1} className="input" value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: Number(e.target.value) })} /></Field>
            <Field label="반"><input type="number" min={1} className="input" value={editing.classNo} onChange={(e) => setEditing({ ...editing, classNo: Number(e.target.value) })} /></Field>
          </div>
          <Field label="담임"><Input value={editing.teacher} onChange={(e) => setEditing({ ...editing, teacher: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
