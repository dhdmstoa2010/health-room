import type { ReactNode } from 'react'
import { classLabel, type ClassInfo } from './data'

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      <div className="no-print">{actions}</div>
    </div>
  )
}

export function Modal({
  title, onClose, onSubmit, submitLabel = '저장', children,
}: {
  title: string
  onClose: () => void
  onSubmit?: () => void
  submitLabel?: string
  children: ReactNode
}) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.()
        }}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="x" onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>취소</button>
          {onSubmit && <button type="submit" className="btn primary">{submitLabel}</button>}
        </div>
      </form>
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export function ClassSelect({
  classes, grade, classNo, onChange, allowAll = false,
}: {
  classes: ClassInfo[]
  grade: number
  classNo: number
  onChange: (grade: number, classNo: number) => void
  allowAll?: boolean
}) {
  const sorted = [...classes].sort((a, b) => a.grade - b.grade || a.classNo - b.classNo)
  return (
    <select
      className="input"
      value={grade ? `${grade}-${classNo}` : ''}
      onChange={(e) => {
        const [g, c] = e.target.value.split('-').map(Number)
        onChange(g || 0, c || 0)
      }}
    >
      <option value="">{allowAll ? '전체 학년반' : '선택'}</option>
      {sorted.map((c) => (
        <option key={c.id} value={`${c.grade}-${c.classNo}`}>{classLabel(c.grade, c.classNo)}</option>
      ))}
    </select>
  )
}

export function Empty({ children = '데이터가 없습니다.' }: { children?: ReactNode }) {
  return <div className="empty">{children}</div>
}

export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <Empty />
  return (
    <div>
      {items.map((i) => (
        <div className="bar-row" key={i.label}>
          <span>{i.label}</span>
          <div className="bar"><i style={{ width: `${(i.value / max) * 100}%` }} /></div>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  )
}
