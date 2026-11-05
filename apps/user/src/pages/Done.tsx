import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const AUTO_RESET_SEC = 10

export function Done({ name, symptom, treatment, onReset }: { name: string; symptom: string; treatment: string; onReset: () => void }) {
  // 접수 완료 후 일정 시간이 지나면 자동으로 처음 화면으로 돌아간다
  const [left, setLeft] = useState(AUTO_RESET_SEC)
  const reset = useRef(onReset)
  useEffect(() => {
    reset.current = onReset
  })
  useEffect(() => {
    if (left <= 0) return reset.current()
    const t = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  return (
    <div className="m-auto w-full max-w-md text-center">
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-brand-soft text-brand">
        <Check className="size-8" />
      </div>
      <h1 className="text-2xl font-bold">접수가 완료됐어요</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{name} 학생, 보건 선생님께 알려드렸어요.</p>
      <Card className="gap-0 p-5 text-left">
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">증상</dt>
          <dd className="m-0 font-medium">{symptom}</dd>
          <dt className="text-muted-foreground">처치</dt>
          <dd className="m-0 font-medium">{treatment}</dd>
        </dl>
      </Card>
      <Button variant="outline" size="lg" className="mt-6 w-full" onClick={onReset}>
        처음으로
      </Button>
      <p className="mt-3 text-sm text-muted-foreground">{left}초 뒤 처음 화면으로 돌아가요</p>
    </div>
  )
}
