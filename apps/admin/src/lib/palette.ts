import type { Code } from './data'

// 카테고리형 팔레트 (흰 배경에서 구분되는 중채도 색상)
export const PALETTE = [
  '#2e7d32', '#2563eb', '#d97706', '#9333ea', '#dc2626',
  '#0891b2', '#db2777', '#65a30d', '#4f46e5', '#475569',
] as const

export const paletteAt = (i: number) => PALETTE[i % PALETTE.length]

/** 증상 코드 순서 기준으로 이름 → 색상 매핑 (대시보드·보건일지에서 동일한 색 사용) */
export function symptomColors(codes: Code[]): Record<string, string> {
  return Object.fromEntries(
    codes.filter((c) => c.group === 'symptom').map((c, i) => [c.name, paletteAt(i)]),
  )
}
