import { useCallback, useEffect, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { OptionPicker } from '@/components/OptionPicker'
import { Footer, PageTitle, StudentBanner } from '@/components/Shell'
import { Button } from '@/components/ui/button'
import { useEnterKey } from '@/components/useEnterKey'
import { TREATMENTS } from '../lib/api'

export function TreatmentSelect({
  student,
  symptom,
  value,
  submitting,
  error,
  onChange,
  returning,
  onReturned,
  onEditTreatment,
  onEdit,
  onSubmit,
}: {
  student: { grade: number; classNo: number; number: number; name: string }
  symptom: string
  value: string
  submitting: boolean
  error: string
  onChange: (treatment: string) => void
  /** 확인 모달에서 수정하고 돌아온 경우: 처치가 이미 있으면 모달을 바로 열고, 없으면 처치를 고르는 즉시 연다 */
  returning: boolean
  onReturned: () => void
  /** 모달에서 처치 수정을 눌렀을 때(다시 고르면 모달로 돌아온다) */
  onEditTreatment: () => void
  onEdit: (step: 'student' | 'symptom') => void
  onSubmit: () => void
}) {
  const [confirming, setConfirming] = useState(returning && !!value)
  useEffect(() => {
    if (confirming) onReturned()
  }, [confirming, onReturned])
  const review = useCallback(() => setConfirming(true), [])
  useEnterKey(!!value && !confirming, review)

  return (
    <>
      <PageTitle divider title="어떤 처치를 받았나요?" sub={`증상: ${symptom}`}>
        <StudentBanner {...student} />
      </PageTitle>
      <OptionPicker
        // 증상이 바뀌면 처치 선택지도 달라지므로 선택기를 새로 만든다
        key={symptom}
        options={TREATMENTS[symptom] ?? ['휴식', '안정']}
        etcPlaceholder="처치 내용을 직접 입력해 주세요"
        initial={value}
        onChange={onChange}
        onPick={() => returning && setConfirming(true)}
      />
      <Footer>
        <Button disabled={!value} onClick={review}>
          접수하기
        </Button>
      </Footer>
      <ConfirmDialog
        open={confirming}
        title="접수하기 전에 확인해 주세요"
        description="접수하면 보건 선생님께 전달돼요. 내용이 맞는지 한 번 더 확인해 주세요."
        rows={[
          { label: '학생', value: `${student.grade}학년 ${student.classNo}반 ${student.number}번 ${student.name}`, onEdit: () => onEdit('student') },
          { label: '증상', value: symptom, onEdit: () => onEdit('symptom') },
          {
            label: '처치',
            value,
            onEdit: () => {
              setConfirming(false)
              onEditTreatment()
            },
          },
        ]}
        confirmLabel="접수할게요"
        cancelLabel="더 확인할게요"
        loading={submitting}
        error={error}
        onConfirm={onSubmit}
        onClose={() => setConfirming(false)}
      />
    </>
  )
}
