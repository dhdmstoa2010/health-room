import { useCallback, useState } from 'react'
import { Shell } from './components/Shell'
import { useIdleReset } from './components/useIdleReset'
import { TREATMENTS, postVisit } from './lib/api'
import { useFlow } from './lib/useFlow'
import { Done } from './pages/Done'
import { StudentSelect } from './pages/StudentSelect'
import { SymptomSelect } from './pages/SymptomSelect'
import { TreatmentSelect } from './pages/TreatmentSelect'

// 조작이 없으면 입력 중이던 학생 정보가 화면에 남지 않도록 처음 화면으로 돌아간다
const IDLE_RESET_MS = 90_000

export default function App() {
  const { flow, go, back, reset } = useFlow()
  // 증상은 화면 간 임시 상태(쿼리에는 싣지 않음)
  const [symptom, setSymptom] = useState('')
  const [treatment, setTreatment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  // 최종 확인 모달에서 수정하러 나온 경우: 수정을 마치면 처치 단계로 바로 돌아가 모달을 다시 연다
  const [returning, setReturning] = useState(false)
  const endReturn = useCallback(() => setReturning(false), [])
  const [resetKey, setResetKey] = useState(0) // 바뀌면 화면 안의 선택 상태까지 모두 새로 시작

  const { grade, classNo, number, name } = flow
  // 증상 없이 처치 주소로 직접 들어온 경우(새로고침 등) 증상 선택부터
  const step = flow.step === 'treatment' && !symptom ? 'symptom' : flow.step
  const student = grade && classNo && number ? { grade, classNo, number, name } : null

  // 증상이 바뀌면 이전에 고른 처치는 의미가 없으므로 초기화
  const changeSymptom = (v: string) => {
    if (v !== symptom) {
      // 확인 모달에서 수정 중이면 새 증상에도 맞는 처치(또는 직접 적은 처치)는 그대로 둔다
      const keep = returning && !!treatment && (TREATMENTS[v]?.includes(treatment) || !TREATMENTS[symptom]?.includes(treatment))
      if (!keep) setTreatment('')
    }
    setSymptom(v)
  }

  async function submit() {
    if (!student) return
    setSubmitting(true)
    setError('')
    try {
      await postVisit({ grade: student.grade, classNo: student.classNo, number: student.number, symptom, treatment })
      go({ ...flow, step: 'done' })
    } catch {
      setError('접수에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAll = () => {
    setSymptom('')
    setTreatment('')
    setError('')
    setSubmitting(false)
    setReturning(false)
    reset()
    setResetKey((k) => k + 1)
  }
  useIdleReset(IDLE_RESET_MS, resetAll)

  const jump = (target: 'student' | 'symptom') => go({ ...flow, step: target })
  const editFromReview = (target: 'student' | 'symptom') => {
    setReturning(true)
    jump(target)
  }
  // 수정 중이면 다음 단계를 거치지 않고 처치 단계로 곧장 돌아간다
  const advance = (f: typeof flow) => go(returning ? { ...f, step: 'treatment' } : f)

  return (
    <Shell
      key={resetKey}
      step={step}
      onJump={jump}
      onBack={step !== 'student' && step !== 'done' ? back : undefined}
    >
      {step === 'student' && <StudentSelect flow={flow} onNext={advance} />}
      {step === 'symptom' && student && (
        <SymptomSelect
          student={student}
          value={symptom}
          onChange={changeSymptom}
          onNext={() => go({ ...flow, step: 'treatment' })}
        />
      )}
      {step === 'treatment' && student && (
        <TreatmentSelect
          student={student}
          symptom={symptom}
          value={treatment}
          submitting={submitting}
          error={error}
          onChange={setTreatment}
          returning={returning}
          onReturned={endReturn}
          onEditTreatment={() => setReturning(true)}
          onEdit={editFromReview}
          onSubmit={submit}
        />
      )}
      {step === 'done' && (
        <Done
          name={name}
          symptom={symptom}
          treatment={treatment}
          onReset={resetAll}
        />
      )}
    </Shell>
  )
}
