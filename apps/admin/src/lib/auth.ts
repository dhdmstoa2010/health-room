import { useSyncExternalStore } from 'react'

/**
 * 어드민 인증(비밀번호 전용).
 * - VITE_API_URL 이 있으면 POST {VITE_API_URL}/auth/login 으로 서버에 검증한다.
 * - 없으면 개발 모드(`npm run dev`)에서만 목업으로 동작하며 VITE_ADMIN_PASSWORD(기본 admin1234)와 비교한다.
 *   운영 빌드에서는 서버 없이 로그인할 수 없다.
 */
const TOKEN_KEY = 'health-room:admin:token'
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
const MOCK_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin1234'

export class LoginError extends Error {
  kind: 'wrong' | 'network'
  constructor(kind: 'wrong' | 'network', message: string) {
    super(message)
    this.kind = kind
  }
}

/* ---------- 토큰 저장 (탭을 닫으면 로그아웃되도록 sessionStorage) ---------- */
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* 저장소를 못 쓰면 로그인 유지가 안 될 뿐이다 */
  }
  emit()
}

/* ---------- API ---------- */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** POST /auth/login  { password } → 200 { token } / 401 비밀번호 불일치 */
export async function login(password: string): Promise<void> {
  if (!API_URL) {
    if (!import.meta.env.DEV) throw new LoginError('network', '서버 주소(VITE_API_URL)가 설정되지 않았습니다.')
    await delay(300)
    if (password !== MOCK_PASSWORD) throw new LoginError('wrong', '비밀번호가 올바르지 않습니다.')
    return setToken('mock-admin-token')
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  } catch {
    throw new LoginError('network', '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }
  if (res.status === 401) throw new LoginError('wrong', '비밀번호가 올바르지 않습니다.')
  if (!res.ok) throw new LoginError('network', '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
  const { token } = (await res.json()) as { token: string }
  setToken(token)
}

export function logout() {
  setToken(null)
}

/** 인증이 필요한 API 호출용: Authorization 헤더 + 401 이면 자동 로그아웃 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_URL ?? ''}${path}`, { ...init, headers })
  if (res.status === 401) logout()
  return res
}

/** 현재 로그인 여부 */
export function useAuthed(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => getToken() !== null,
  )
}
