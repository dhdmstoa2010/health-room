import { useCallback, useEffect, useState } from 'react'

export type Step = 'student' | 'symptom' | 'treatment' | 'done'

export type Flow = {
  step: Step
  grade: number | null
  classNo: number | null
  number: number | null
  name: string
}

const EMPTY: Flow = { step: 'student', grade: null, classNo: null, number: null, name: '' }
const PREV: Partial<Record<Step, Step>> = { symptom: 'student', treatment: 'symptom' }

function toQuery(f: Flow) {
  const q = new URLSearchParams({ step: f.step })
  if (f.grade) q.set('grade', String(f.grade))
  if (f.classNo) q.set('classNo', String(f.classNo))
  if (f.number) q.set('number', String(f.number))
  if (f.name) q.set('name', f.name)
  return `?${q.toString()}`
}

function read(): Flow {
  const q = new URLSearchParams(location.search)
  const num = (k: string) => {
    const v = Number(q.get(k))
    return Number.isInteger(v) && v > 0 ? v : null
  }
  const raw = q.get('step')
  const step: Step = raw === 'symptom' || raw === 'treatment' || raw === 'done' ? raw : 'student'
  const f: Flow = { step, grade: num('grade'), classNo: num('classNo'), number: num('number'), name: q.get('name') ?? '' }
  // 학생 정보가 덜 채워졌으면 학생 선택부터
  if (step !== 'student' && !(f.grade && f.classNo && f.number)) return { ...f, step: 'student' }
  return f
}

/** 단계와 선택값을 쿼리스트링과 히스토리에 동기화한다. */
export function useFlow() {
  const [flow, setFlow] = useState<Flow>(read)

  useEffect(() => {
    const onPop = () => setFlow(read())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  /** 다음 단계로 이동(히스토리 추가) → 브라우저 뒤로가기도 동일하게 동작 */
  const go = useCallback((next: Flow) => {
    const idx = (history.state?.idx ?? 0) as number
    // 학생 선택 화면을 떠날 때 선택값을 현재 히스토리에 남겨, 뒤로 오면 그대로 복원한다
    if (read().step === 'student' && next.step === 'symptom') {
      history.replaceState({ idx }, '', toQuery({ ...next, step: 'student' }))
    }
    history.pushState({ idx: idx + 1 }, '', toQuery(next))
    setFlow(next)
  }, [])

  /**
   * 이전 단계로. 앱 안에서 쌓인 히스토리가 있으면 그대로 뒤로 가고,
   * 주소로 바로 진입한 경우(히스토리 없음)에는 이전 단계 화면으로 직접 이동해 앱을 벗어나지 않는다.
   */
  const back = useCallback(() => {
    if ((history.state?.idx ?? 0) > 0) return history.back()
    const cur = read()
    const prev = PREV[cur.step]
    if (!prev) return
    const next = { ...cur, step: prev }
    history.replaceState({ idx: 0 }, '', toQuery(next))
    setFlow(next)
  }, [])

  /** 처음 화면으로(선택값 비움) */
  const reset = useCallback(() => {
    history.replaceState({ idx: 0 }, '', toQuery(EMPTY))
    setFlow(EMPTY)
  }, [])

  return { flow, go, back, reset }
}
