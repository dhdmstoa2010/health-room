import { useState } from 'react'
import { PageTitle } from '@/components/Shell'
import { Button } from '@/components/ui/button'
import { CLASSES, GRADES, MAX_NUMBER, fetchStudent } from '../lib/api'
import type { Flow } from '../lib/useFlow'

/** show=false여도 자리는 유지해(invisible) 화면 높이를 항상 꽉 채운다. */
// 학년 > 반 > 번호 순으로 중요도가 낮아지도록 라벨·버튼 크기를 단계별로 줄인다
const LEVEL = {
  1: { label: 'mb-3 text-xl font-bold text-foreground', button: 'h-16 text-2xl' },
  2: { label: 'mb-2.5 text-lg font-semibold text-foreground/80', button: 'h-14 text-xl' },
  3: { label: 'mb-2 text-base font-semibold text-muted-foreground', button: 'h-12 text-lg' },
} as const

function Section({ label, show, level, children }: { label: string; show: boolean; level: 1 | 2 | 3; children: React.ReactNode }) {
  return (
    <section
      className={`flex flex-col ${show ? 'animate-in fade-in slide-in-from-top-2 duration-200' : 'invisible'}`}
    >
      <h2 className={LEVEL[level].label}>{label}</h2>
      {children}
    </section>
  )
}

/** 학년 → 반 → 번호를 한 페이지에서 단계적으로 노출한다. */
export function StudentSelect({ flow, onNext }: { flow: Flow; onNext: (f: Flow) => void }) {
  const [grade, setGrade] = useState(flow.grade)
  const [classNo, setClassNo] = useState(flow.classNo)
  const [number, setNumber] = useState(flow.number)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pickGrade = (g: number) => {
    if (g === grade) return
    setGrade(g)
    setClassNo(null) // 학년이 바뀌면 반·번호 초기화
    setNumber(null)
    setError('')
  }
  const pickClass = (c: number) => {
    if (c === classNo) return
    setClassNo(c)
    setNumber(null) // 반이 바뀌면 번호 초기화
    setError('')
  }

  // 번호를 고르면 이름을 조회해 바로 다음 단계로 넘어간다
  const pickNumber = async (n: number) => {
    if (!grade || !classNo || loading) return
    setNumber(n)
    setLoading(true)
    setError('')
    try {
      const student = await fetchStudent(grade, classNo, n)
      if (!student) return setError('해당 번호의 학생을 찾을 수 없어요. 다시 선택해 주세요.')
      onNext({ step: 'symptom', grade, classNo, number: n, name: student.name })
    } catch {
      setError('학생 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle divider title="보건실 접수" sub="학년, 반, 번호를 차례로 선택해 주세요." />
      <div className="flex flex-col gap-6">
        <Section label="학년" show level={1}>
          <div className="grid grid-cols-3 gap-5">
            {GRADES.map((g) => (
              <Button key={g} variant={grade === g ? 'default' : 'outline'} className={LEVEL[1].button} onClick={() => pickGrade(g)}>
                {g}학년
              </Button>
            ))}
          </div>
        </Section>
        <Section label="반" show={!!grade} level={2}>
          {grade && (
            <div className="grid grid-cols-4 gap-5">
              {CLASSES.map((c) => (
                <Button key={c} variant={classNo === c ? 'default' : 'outline'} className={LEVEL[2].button} onClick={() => pickClass(c)}>
                  {c}반
                </Button>
              ))}
            </div>
          )}
        </Section>
        <Section label="번호" show={!!(grade && classNo)} level={3}>
          {grade && classNo && (
            <div className="grid grid-cols-4 gap-5 md:grid-cols-8">
              {Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={number === n ? 'default' : 'outline'}
                  className={LEVEL[3].button}
                  disabled={loading}
                  onClick={() => pickNumber(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          )}
        </Section>
      </div>
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
    </>
  )
}
