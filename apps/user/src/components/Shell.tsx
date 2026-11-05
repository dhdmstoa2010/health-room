import { Check } from 'lucide-react'
import { createContext, Fragment, useContext, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ORDER = ['student', 'symptom', 'treatment']
const LABELS = ['학생', '증상', '처치']

const BackContext = createContext<(() => void) | undefined>(undefined)

/** 상단에 진행 단계를, 하단에 행동 버튼(이전/다음)을 둔 레이아웃 */
export function Shell({
  step,
  onBack,
  onJump,
  children,
}: {
  step: string
  onBack?: () => void
  /** 완료한 이전 단계로 바로 돌아가 수정 */
  onJump?: (step: 'student' | 'symptom') => void
  children: ReactNode
}) {
  const idx = ORDER.indexOf(step)
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-input py-3">
        <ol className="m-0 mx-auto flex w-fit list-none items-center gap-2.5 p-0" aria-label="접수 단계">
          {ORDER.map((s, i) => {
            const done = step === 'done' || i < idx
            const current = i === idx
            const editable = step !== 'done' && i < idx && onJump
            const Row = editable ? 'button' : 'div'
            return (
              <Fragment key={s}>
                {i > 0 && <li aria-hidden className={cn('h-0.5 w-12 rounded-full bg-[#d9d9d9]', i <= idx || step === 'done' ? 'bg-brand' : '')} />}
                <li aria-current={current ? 'step' : undefined}>
                  <Row
                    {...(editable ? { type: 'button' as const, onClick: () => onJump(s as 'student' | 'symptom'), title: `${LABELS[i]} 수정하기` } : {})}
                    className={cn('flex items-center gap-1.5 rounded-full text-left', editable && 'cursor-pointer hover:opacity-80')}
                  >
                    <b
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full bg-[#c9c9c9] text-xs text-white',
                        (current || done) && 'bg-brand',
                      )}
                    >
                      {done ? <Check className="size-3.5" /> : i + 1}
                    </b>
                    <span className={cn('text-sm font-bold', current ? 'text-foreground' : done ? 'text-foreground' : 'text-muted-foreground')}>
                      {LABELS[i]}
                    </span>
                  </Row>
                </li>
              </Fragment>
            )
          })}
        </ol>
      </header>
      <BackContext.Provider value={onBack}>
        <main className="flex min-w-0 flex-1 flex-col px-6 pt-[34px] md:px-12 [&>*]:mx-auto [&>*]:w-full [&>*]:max-w-4xl [&>*:nth-last-child(2)]:mb-10">
          {children}
        </main>
      </BackContext.Provider>
    </div>
  )
}

export function PageTitle({ title, sub, divider, children }: { title: string; sub?: string; divider?: boolean; children?: ReactNode }) {
  return (
    <div className={cn('mb-8', divider && 'border-b border-input pb-6')}>
      <h1 className="text-5xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-base font-normal text-muted-foreground">{sub}</p>}
      {children}
    </div>
  )
}

export function StudentBanner({ grade, classNo, number, name }: { grade: number; classNo: number; number: number; name: string }) {
  return (
    <p className="mt-6 text-right text-lg font-bold tracking-tight">
      <span className="text-muted-foreground">
        {grade}학년 {classNo}반 {number}번
      </span>{' '}
      {name}
    </p>
  )
}

/** 화면 하단에 고정되는 행동 버튼 영역. 이전은 왼쪽, 주 버튼(다음/접수하기)은 오른쪽. hint는 주 버튼이 비활성일 때 이유를 알려준다. */
export function Footer({ children, hint }: { children?: ReactNode; hint?: string }) {
  const onBack = useContext(BackContext)
  return (
    <div
      data-footer
      className="sticky bottom-0 mt-auto flex !w-auto !max-w-none !-mx-6 items-center gap-4 bg-background px-8 py-4 md:!-mx-12"
    >
      {onBack && (
        <Button variant="outline" className="h-12 min-w-[144px] text-[1.05rem]" onClick={onBack}>
          이전
        </Button>
      )}
      <span className="flex-1" />
      <div className="flex items-center gap-[48px]">
        {hint && <p className="text-[1.05rem] text-muted-foreground">{hint}</p>}
        {children && <div className="[&>button]:h-12 [&>button]:min-w-[144px] [&>button]:text-[1.05rem]">{children}</div>}
      </div>
    </div>
  )
}
