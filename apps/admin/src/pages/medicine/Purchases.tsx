import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/date-picker'
import { useState } from 'react'
import { nameMap, today, uid, useCodes, usePurchases, type Purchase } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'
import { useConfirm } from '@/components/common/confirm'

const blank = (): Purchase => ({ id: uid(), date: today(), medicineId: '', qty: 1, note: '' })

export default function Purchases() {
  const crud = usePurchases()
  const { items: codes } = useCodes()
  const names = nameMap(codes)
  const medicines = codes.filter((c) => c.group === 'medicine' && c.active)
  const [editing, setEditing] = useState<Purchase | null>(null)
  const patch = (p: Partial<Purchase>) => setEditing((e) => (e ? { ...e, ...p } : e))
  const rows = [...crud.items].sort((a, b) => b.date.localeCompare(a.date))

  const { ask, dialog } = useConfirm()
  return (
    <>
      {dialog}
      <PageHeader
        title="약품구입등록"
        desc="약품 구입수량 등록"
        actions={<Button variant="default" onClick={() => setEditing(blank())}>+ 구입 등록</Button>}
      />
      <Card className="gap-0 p-5 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>보건일자</TableHead><TableHead>약품</TableHead><TableHead className="num">구입수량</TableHead><TableHead>비고</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell><TableCell>{names[r.medicineId] ?? '-'}</TableCell><TableCell className="num">{r.qty}</TableCell><TableCell>{r.note}</TableCell>
                <TableCell className="actions">
                  <Button variant="outline" size="sm" onClick={() => setEditing({ ...r })}>수정</Button>
                  <Button variant="outline" className="text-destructive" size="sm" onClick={() => ask(`약품구입: ${r.date} ${names[r.medicineId] ?? '-'} ${r.qty}개`, () => crud.remove(r.id))}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty>등록된 구입 내역이 없습니다.</Empty>}
      </Card>

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
            <NativeSelect value={editing.medicineId} onChange={(e) => patch({ medicineId: e.target.value })}>
              <option value="">선택</option>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="구입수량"><input type="number" min={1} className="input" value={editing.qty} onChange={(e) => patch({ qty: Number(e.target.value) })} /></Field>
          <Field label="비고"><Input value={editing.note} onChange={(e) => patch({ note: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
