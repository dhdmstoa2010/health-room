import { useEffect, useRef } from 'react'

const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const

/** 아무 조작 없이 ms가 지나면 onIdle을 한 번 호출한다. 조작이 다시 생기면 타이머를 새로 시작한다. */
export function useIdleReset(ms: number, onIdle: () => void) {
  const cb = useRef(onIdle)
  useEffect(() => {
    cb.current = onIdle
  })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(() => cb.current(), ms)
    }
    arm()
    EVENTS.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    return () => {
      clearTimeout(timer)
      EVENTS.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [ms])
}
