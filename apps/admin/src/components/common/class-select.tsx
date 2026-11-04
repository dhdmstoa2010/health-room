import { NativeSelect } from '@/components/ui/input'
import { classLabel, type ClassInfo } from '@/lib/data'

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
    <NativeSelect
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
    </NativeSelect>
  )
}
