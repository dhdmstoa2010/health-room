import { useEffect } from 'react'

/**
 * Enter 키로 "다음"을 누른 것과 같은 동작을 한다. (바로 넘어가지 않고 확인 모달이 열리는 용도)
 * 입력창(textarea)·모달 안·하단 버튼 위에서는 동작하지 않는다.
 */
export function useEnterKey(enabled: boolean, fn: () => void) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing || e.repeat) return
      const t = e.target as HTMLElement
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') return
      if (t.closest('[role="dialog"], [data-footer]')) return
      e.preventDefault() // 포커스된 선택 버튼이 다시 눌리는 것 방지
      fn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, fn])
}
