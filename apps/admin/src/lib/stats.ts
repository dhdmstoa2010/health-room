import type { HealthLog, MedUse, Purchase } from '@/lib/data'

/** 통계 초기화 시점(월)부터 시작하는 12개월 (학년도 기준) */
export function academicMonths(year: number, resetMonth: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const m = ((resetMonth - 1 + i) % 12) + 1
    const y = resetMonth - 1 + i >= 12 ? year + 1 : year
    return { key: `${y}-${String(m).padStart(2, '0')}`, label: `${m}월` }
  })
}

/** 현재 날짜가 속한 학년도 */
export function currentAcademicYear(resetMonth: number): number {
  const now = new Date()
  return now.getMonth() + 1 >= resetMonth ? now.getFullYear() : now.getFullYear() - 1
}

export function countBy<T>(rows: T[], keyOf: (r: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) out[keyOf(r)] = (out[keyOf(r)] ?? 0) + 1
  return out
}

export type LedgerEntry = {
  date: string
  kind: '입고' | '출고'
  qty: number
  note: string
}

/** 약품 하나의 입출고 내역 (일자순, 같은 날은 입고 먼저) */
export function ledgerFor(medicineId: string, logs: HealthLog[], purchases: Purchase[]): LedgerEntry[] {
  const entries: LedgerEntry[] = []
  for (const p of purchases) {
    if (p.medicineId === medicineId) entries.push({ date: p.date, kind: '입고', qty: p.qty, note: p.note || '구입' })
  }
  for (const l of logs) {
    const used = l.medicines.find((m: MedUse) => m.medicineId === medicineId)
    if (used) entries.push({ date: l.date, kind: '출고', qty: used.qty, note: `${l.studentName} 처치` })
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? 0 : a.kind === '입고' ? -1 : 1))
}

export function stockOf(medicineId: string, logs: HealthLog[], purchases: Purchase[]): number {
  return ledgerFor(medicineId, logs, purchases).reduce((s, e) => s + (e.kind === '입고' ? e.qty : -e.qty), 0)
}
