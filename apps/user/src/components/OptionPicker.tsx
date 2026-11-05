import { Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ETC = '__etc__'

export function OptionPicker({
  options,
  etcPlaceholder,
  initial = '',
  onChange,
  onPick,
}: {
  options: string[]
  etcPlaceholder: string
  /** 이전에 고른 값(뒤로 돌아왔을 때 복원) */
  initial?: string
  onChange: (value: string) => void
  /** 목록에서 고르거나 기타 입력 후 Enter를 눌렀을 때(다음 단계로 바로 넘어갈 때 사용) */
  onPick?: () => void
}) {
  const [sel, setSel] = useState(initial ? (options.includes(initial) ? initial : ETC) : '')
  const [etc, setEtc] = useState(initial && !options.includes(initial) ? initial : '')

  const update = (s: string, e: string) => {
    setSel(s)
    setEtc(e)
    onChange(s === ETC ? e.trim() : s)
  }

  const item = (key: string, label: string) => (
    <Button
      key={key}
      variant="outline"
      className={`h-[54px] justify-between px-5 text-[1.2rem] ${sel === key ? 'border-brand bg-brand-soft font-bold text-foreground hover:bg-brand-soft hover:text-foreground' : ''}`}
      onClick={() => {
        update(key, etc)
        if (key !== ETC) setTimeout(() => onPick?.(), 250) // 선택 표시가 보인 뒤 넘어간다
      }}
    >
      {label}
      {sel === key && <Check className="text-brand" />}
    </Button>
  )

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {options.map((o) => item(o, o))}
      {item(ETC, '기타')}
      {sel === ETC && (
        <Input
          className="col-span-full h-[54px] px-5 text-[1.2rem] md:text-[1.2rem]"
          placeholder={etcPlaceholder}
          value={etc}
          maxLength={100}
          autoFocus
          onChange={(e) => update(ETC, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && etc.trim()) onPick?.()
          }}
        />
      )}
    </div>
  )
}
