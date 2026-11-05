import { OptionPicker } from '@/components/OptionPicker'
import { Footer, PageTitle, StudentBanner } from '@/components/Shell'
import { SYMPTOMS } from '../lib/api'

/** 증상을 고르면 바로 다음 단계로 넘어간다(기타는 입력 후 Enter). */
export function SymptomSelect({
  student,
  value,
  onChange,
  onNext,
}: {
  student: { grade: number; classNo: number; number: number; name: string }
  value: string
  onChange: (symptom: string) => void
  onNext: () => void
}) {
  return (
    <>
      <PageTitle divider title="어디가 불편한가요?" sub="증상을 하나 선택해 주세요.">
        <StudentBanner {...student} />
      </PageTitle>
      <OptionPicker options={SYMPTOMS} etcPlaceholder="증상을 직접 입력해 주세요(입력 후 Enter)" initial={value} onChange={onChange} onPick={onNext} />
      <Footer />
    </>
  )
}
