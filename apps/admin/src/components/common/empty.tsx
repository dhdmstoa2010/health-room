import type { ReactNode } from 'react'

export function Empty({ children = '데이터가 없습니다.' }: { children?: ReactNode }) {
  return <div className="empty">{children}</div>
}
