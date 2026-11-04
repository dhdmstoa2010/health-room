import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { uid, useCodes, useLogs, usePurchases, type Code } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'

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
        actions={<Button variant="default" onClick={() => setEditing({ id: uid(), group, name: '', active: true })}>+ 코드 등록</Button>}
      />
      <div className="toolbar">
        {GROUPS.map((g) => (
          <Button key={g.key} variant={group === g.key ? 'default' : 'outline'} onClick={() => setGroup(g.key)}>{g.label}</Button>
        ))}
      </div>
      <Card className="gap-0 p-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>코드명</TableHead><TableHead>상태</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell><Badge variant={c.active ? 'secondary' : 'outline'}>{c.active ? '사용' : '사용안함'}</Badge></TableCell>
                <TableCell className="actions">
                  <Button variant="outline" size="sm" onClick={() => crud.save({ ...c, active: !c.active })}>{c.active ? '사용안함' : '사용'}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing({ ...c })}>수정</Button>
                  <Button variant="outline" className="text-destructive" size="sm" onClick={() => remove(c)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty>등록된 코드가 없습니다.</Empty>}
      </Card>

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
          <Field label="코드명"><Input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
