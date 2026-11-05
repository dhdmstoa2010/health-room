export type Student = { id: string; grade: number; classNo: number; number: number; name: string }

export const GRADES = [1, 2, 3]
export const CLASSES = [1, 2, 3, 4]
export const MAX_NUMBER = 16

export const SYMPTOMS = ['두통', '복통', '감기', '외상', '찰과상', '생리통', '어지러움']

// 증상별 추천 처치 (TODO: 서버 코드 API 연동)
export const TREATMENTS: Record<string, string[]> = {
  두통: ['휴식', '약 복용', '냉찜질'],
  복통: ['휴식', '소화제 투여', '온찜질'],
  감기: ['체온 측정', '휴식', '약 복용'],
  외상: ['냉찜질', '소독 및 밴드 부착', '병원 안내'],
  찰과상: ['소독', '밴드 부착'],
  생리통: ['휴식', '약 복용', '온찜질'],
  어지러움: ['안정', '휴식', '체온/혈압 측정'],
}

const NAMES = ['김하늘', '이준호', '박서연', '최민준', '정유진', '한도윤', '오지우', '윤서준', '강하은', '송예준']
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * GET /students?grade=&classNo=&number= → 이름 조회.
 * TODO: 서버 연동 전 임시 목업. 없는 번호는 null.
 */
export async function fetchStudent(grade: number, classNo: number, number: number): Promise<Student | null> {
  await delay(250)
  if (number < 1 || number > MAX_NUMBER) return null
  const name = NAMES[(grade * 7 + classNo * 3 + number) % NAMES.length]
  return { id: `${grade}-${classNo}-${number}`, grade, classNo, number, name }
}

export type VisitPayload = { grade: number; classNo: number; number: number; symptom: string; treatment: string }

/** POST /visits — 이름은 서버가 매핑하므로 보내지 않는다. */
export async function postVisit(payload: VisitPayload): Promise<void> {
  await delay(300)
  console.info('POST /visits', payload)
}
