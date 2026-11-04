export type Visit = {
  id: number
  studentName: string
  symptom: string
  visitedAt: string // ISO 문자열
}

export function formatVisitTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
