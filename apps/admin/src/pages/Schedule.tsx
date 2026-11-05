import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/date-picker'
import { useMemo, useState } from 'react'
import { dateStr, pad, today, uid, useSchedules, type Schedule as ScheduleT } from '@/lib/data'
import { Empty } from '@/components/common/empty'
import { Field } from '@/components/common/field'
import { Modal } from '@/components/common/modal'
import { PageHeader } from '@/components/common/page-header'
import { useConfirm } from '@/components/common/confirm'

const CATEGORIES = ['행사', '검진', '교육', '기타']
const blank = (date = today()): ScheduleT => ({ id: uid(), date, time: '09:00', category: '행사', title: '', content: '' })

export default function Schedule() {
  const crud = useSchedules()
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [from, setFrom] = useState(`${cursor.y}-${pad(cursor.m + 1)}-01`)
  const [to, setTo] = useState(dateStr(new Date(cursor.y, cursor.m + 1, 0)))
  const [editing, setEditing] = useState<ScheduleT | null>(null)
  const patch = (p: Partial<ScheduleT>) => setEditing((e) => (e ? { ...e, ...p } : e))

  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
    setFrom(dateStr(d))
    setTo(dateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)))
  }

  const rows = crud.items.filter((s) => s.date >= from && s.date <= to).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
    return [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (number | null)[]
  }, [cursor])

  const { ask, dialog } = useConfirm()
  return (
    <>
      {dialog}
      <PageHeader
        title="일정등록/조회"
        desc="보건실 일정 등록·조회"
        actions={<Button variant="default" onClick={() => setEditing(blank())}>+ 일정 등록</Button>}
      />
      <div className="grid side">
        <Card className="gap-0 p-5">
          <div className="toolbar">
            <Button variant="outline" size="sm" onClick={() => move(-1)}>‹</Button>
            <b>{cursor.y}년 {cursor.m + 1}월</b>
            <Button variant="outline" size="sm" onClick={() => move(1)}>›</Button>
          </div>
          <div className="cal">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => <div key={d} className="dow">{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="off" />
              const ds = `${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`
              return (
                <div key={i} className={ds === today() ? 'today' : ''} onDoubleClick={() => setEditing(blank(ds))}>
                  <b>{d}</b>
                  {crud.items.filter((s) => s.date === ds).map((s) => <span key={s.id} className="ev" title={s.title}>{s.time} {s.title}</span>)}
                </div>
              )
            })}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>날짜를 더블클릭하면 해당 일자로 일정을 등록합니다.</p>
        </Card>

        <Card className="gap-0 p-5">
          <h2>기간별 조회</h2>
          <div className="toolbar">
            <DatePicker value={from} onChange={(v) => setFrom(v)} />
            <DatePicker value={to} onChange={(v) => setTo(v)} />
          </div>
          {rows.map((s) => (
            <div key={s.id} style={{ padding: '10px 0', borderTop: '1px solid var(--gray-100)' }}>
              <div><Badge variant="secondary">{s.category}</Badge> <b>{s.title}</b></div>
              <div className="muted">{s.date} {s.time}{s.content && ` · ${s.content}`}</div>
              <div style={{ marginTop: 4 }}>
                <Button variant="outline" size="sm" onClick={() => setEditing({ ...s })}>수정</Button>{' '}
                <Button variant="outline" className="text-destructive" size="sm" onClick={() => ask(`일정: ${s.date} ${s.title}`, () => crud.remove(s.id))}>삭제</Button>
              </div>
            </div>
          ))}
          {!rows.length && <Empty>일정이 없습니다.</Empty>}
        </Card>
      </div>

      {editing && (
        <Modal
          title="일정 등록"
          onClose={() => setEditing(null)}
          onSubmit={() => {
            if (!editing.title.trim()) return alert('제목을 입력하세요.')
            crud.save(editing)
            setEditing(null)
          }}
        >
          <div className="row">
            <Field label="날짜"><DatePicker value={editing.date} onChange={(v) => patch({ date: v })} /></Field>
            <Field label="시간"><input type="time" className="input" value={editing.time} onChange={(e) => patch({ time: e.target.value })} /></Field>
          </div>
          <Field label="구분">
            <NativeSelect value={editing.category} onChange={(e) => patch({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="제목"><Input value={editing.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
          <Field label="내용"><Textarea value={editing.content} onChange={(e) => patch({ content: e.target.value })} /></Field>
        </Modal>
      )}
    </>
  )
}
