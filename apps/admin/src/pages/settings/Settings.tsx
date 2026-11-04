import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { DEFAULT_SETTINGS, dateStr, useLogs, useSettings } from '@/lib/data'
import { Field } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'

export default function Settings() {
  const [saved, setSaved] = useSettings()
  const logs = useLogs()
  const [draft, setDraft] = useState({ ...saved, approvalText: saved.approvalLine.join(', ') })
  const [message, setMessage] = useState('')

  const save = () => {
    const approvalLine = draft.approvalText.split(',').map((s) => s.trim()).filter(Boolean)
    if (!approvalLine.length) return setMessage('결재 라인은 1개 이상 입력하세요.')
    if (draft.dailyRows < 1 || draft.dailyRows > 100) return setMessage('보건일지 생성 건수는 1~100 사이여야 합니다.')
    setSaved({
      dailyRows: draft.dailyRows, approvalLine, statsResetMonth: draft.statsResetMonth, retentionYears: draft.retentionYears,
    })
    setMessage('저장했습니다.')
  }

  const purge = () => {
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - draft.retentionYears)
    const limit = dateStr(cutoff)
    const targets = logs.items.filter((l) => l.date < limit)
    if (!targets.length) return setMessage(`${limit} 이전 보건일지가 없습니다.`)
    if (confirm(`${limit} 이전 보건일지 ${targets.length}건을 영구 삭제합니다. 계속할까요?`)) {
      logs.setItems((prev) => prev.filter((l) => l.date >= limit))
      setMessage(`${targets.length}건을 삭제했습니다.`)
    }
  }

  return (
    <>
      <PageHeader title="환경설정" desc="운영 기준값 설정" />
      <Card  style={{ maxWidth: 560 }}>
        <Field label="보건일지 생성 건수" hint="일괄출력 시 1장에 표시할 행 수">
          <input type="number" className="input" min={1} max={100} value={draft.dailyRows} onChange={(e) => setDraft({ ...draft, dailyRows: Number(e.target.value) })} />
        </Field>
        <Field label="결재 라인" hint="쉼표로 구분 (예: 담당, 교감, 교장). 출력물 결재란에 표시됩니다.">
          <Input value={draft.approvalText} onChange={(e) => setDraft({ ...draft, approvalText: e.target.value })} />
        </Field>
        <Field label="통계 초기화 시점" hint="통계가 시작되는 월 (학년도 시작월)">
          <NativeSelect value={draft.statsResetMonth} onChange={(e) => setDraft({ ...draft, statsResetMonth: Number(e.target.value) })}>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}
          </NativeSelect>
        </Field>
        <Field label="데이터 보관기간(년)">
          <input type="number" className="input" min={1} max={30} value={draft.retentionYears} onChange={(e) => setDraft({ ...draft, retentionYears: Number(e.target.value) })} />
        </Field>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <Button variant="default" onClick={save}>저장</Button>
          <Button variant="outline" onClick={() => setDraft({ ...DEFAULT_SETTINGS, approvalText: DEFAULT_SETTINGS.approvalLine.join(', ') })}>기본값</Button>
          <span className="spacer" />
          <Button variant="outline" className="text-destructive" onClick={purge}>보관기간 경과 데이터 삭제</Button>
        </div>
        {message && <p style={{ marginTop: 12, color: 'var(--green-dark)' }}>{message}</p>}
      </Card>
    </>
  )
}
