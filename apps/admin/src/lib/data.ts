import { useCallback, useEffect, useState } from 'react'

/* ---------- types ---------- */
export type Code = { id: string; group: 'symptom' | 'medicine'; name: string; active: boolean }
export type ClassInfo = { id: string; grade: number; classNo: number; teacher: string }
export type MedUse = { medicineId: string; qty: number }
export type HealthLog = {
  id: string
  date: string
  time: string
  grade: number
  classNo: number
  studentName: string
  symptomId: string
  treatment: string
  medicines: MedUse[]
  note: string
}
export type HospitalCare = {
  id: string
  date: string
  grade: number
  classNo: number
  studentName: string
  hospital: string
  transport: string
  reason: string
  action: string
}
export type Chronic = {
  id: string
  grade: number
  classNo: number
  studentName: string
  symptom: string
  disease: string
  note: string
  registeredAt: string
}
export type Purchase = { id: string; date: string; medicineId: string; qty: number; note: string }
export type Schedule = { id: string; date: string; time: string; category: string; title: string; content: string }
export type Settings = {
  dailyRows: number
  approvalLine: string[]
  statsResetMonth: number
  retentionYears: number
}

/* ---------- helpers ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10)

export const pad = (n: number) => String(n).padStart(2, '0')

export function dateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const today = () => dateStr(new Date())

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return dateStr(d)
}

export const classLabel = (grade: number, classNo: number) => `${grade}학년 ${classNo}반`

/* ---------- localStorage-backed state ---------- */
const PREFIX = 'health-room:admin:'

export function useStore<T>(key: string, seed: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      /* 저장소를 못 읽으면 시드값 사용 */
    }
    return seed()
  })
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [key, value])
  return [value, setValue] as const
}

export function useCrud<T extends { id: string }>(key: string, seed: () => T[]) {
  const [items, setItems] = useStore<T[]>(key, seed)
  const save = useCallback(
    (item: T) =>
      setItems((prev) => (prev.some((p) => p.id === item.id) ? prev.map((p) => (p.id === item.id ? item : p)) : [...prev, item])),
    [setItems],
  )
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((p) => p.id !== id)), [setItems])
  return { items, setItems, save, remove }
}

/* ---------- seeds ---------- */
const seedCodes = (): Code[] => [
  ...['두통', '복통', '감기', '외상', '찰과상', '생리통', '어지러움'].map((name) => ({
    id: `sym-${name}`, group: 'symptom' as const, name, active: true,
  })),
  ...['타이레놀', '소화제', '밴드', '소독약', '파스'].map((name) => ({
    id: `med-${name}`, group: 'medicine' as const, name, active: true,
  })),
]

const seedClasses = (): ClassInfo[] => {
  const list: ClassInfo[] = []
  for (let g = 1; g <= 3; g++) for (let c = 1; c <= 4; c++) list.push({ id: `${g}-${c}`, grade: g, classNo: c, teacher: '' })
  return list
}

const seedLogs = (): HealthLog[] => {
  const rows: [number, string, number, number, string, string, string, [string, number][]][] = [
    [0, '09:20', 1, 2, '김하늘', 'sym-두통', '휴식 후 약 복용', [['med-타이레놀', 1]]],
    [0, '10:45', 2, 1, '이준호', 'sym-찰과상', '소독 및 밴드 부착', [['med-소독약', 1], ['med-밴드', 2]]],
    [0, '13:10', 3, 4, '박서연', 'sym-생리통', '휴식', [['med-타이레놀', 1]]],
    [1, '08:55', 1, 1, '최민준', 'sym-복통', '소화제 투여', [['med-소화제', 1]]],
    [1, '11:30', 2, 3, '정유진', 'sym-감기', '체온 측정, 휴식', []],
    [2, '14:05', 3, 2, '한도윤', 'sym-외상', '냉찜질', []],
    [3, '09:40', 1, 3, '오지우', 'sym-어지러움', '안정', []],
    [5, '10:15', 2, 2, '윤서준', 'sym-두통', '약 복용', [['med-타이레놀', 1]]],
    [9, '12:00', 3, 1, '강하은', 'sym-복통', '소화제 투여', [['med-소화제', 1]]],
    [14, '15:20', 1, 4, '송예준', 'sym-찰과상', '소독', [['med-소독약', 1], ['med-밴드', 1]]],
    [20, '09:05', 2, 4, '임채원', 'sym-감기', '휴식', []],
    [28, '10:50', 3, 3, '배지호', 'sym-두통', '약 복용', [['med-타이레놀', 1]]],
  ]
  return rows.map(([ago, time, grade, classNo, studentName, symptomId, treatment, meds]) => ({
    id: uid(), date: daysAgo(ago), time, grade, classNo, studentName, symptomId, treatment,
    medicines: meds.map(([medicineId, qty]) => ({ medicineId, qty })), note: '',
  }))
}

const seedPurchases = (): Purchase[] => [
  { id: uid(), date: daysAgo(60), medicineId: 'med-타이레놀', qty: 30, note: '' },
  { id: uid(), date: daysAgo(60), medicineId: 'med-소화제', qty: 20, note: '' },
  { id: uid(), date: daysAgo(60), medicineId: 'med-밴드', qty: 100, note: '' },
  { id: uid(), date: daysAgo(60), medicineId: 'med-소독약', qty: 10, note: '' },
  { id: uid(), date: daysAgo(15), medicineId: 'med-타이레놀', qty: 20, note: '추가 구입' },
]

const seedSchedules = (): Schedule[] => [
  { id: uid(), date: daysAgo(-3), time: '10:00', category: '검진', title: '학생 건강검진', content: '전 학년 대상' },
  { id: uid(), date: daysAgo(-10), time: '14:00', category: '교육', title: '감염병 예방 교육', content: '' },
]

export const DEFAULT_SETTINGS: Settings = {
  dailyRows: 20,
  approvalLine: ['담당', '교감', '교장'],
  statsResetMonth: 3,
  retentionYears: 5,
}

/* ---------- domain hooks ---------- */
export const useCodes = () => useCrud<Code>('codes', seedCodes)
export const useClasses = () => useCrud<ClassInfo>('classes', seedClasses)
export const useLogs = () => useCrud<HealthLog>('logs', seedLogs)
export const useHospital = () => useCrud<HospitalCare>('hospital', () => [])
export const useChronic = () => useCrud<Chronic>('chronic', () => [])
export const usePurchases = () => useCrud<Purchase>('purchases', seedPurchases)
export const useSchedules = () => useCrud<Schedule>('schedules', seedSchedules)
export const useSettings = () => useStore<Settings>('settings', () => DEFAULT_SETTINGS)

/** 일자 상관없이 Code id → 이름 */
export function nameMap(codes: Code[]): Record<string, string> {
  return Object.fromEntries(codes.map((c) => [c.id, c.name]))
}
