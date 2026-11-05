import { Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoginError, login } from '@/lib/auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password || loading) return
    setLoading(true)
    setError('')
    try {
      await login(password) // 성공하면 App 이 인증 상태를 감지해 화면을 바꾼다
    } catch (err) {
      setError(err instanceof LoginError ? err.message : '로그인에 실패했습니다.')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-muted px-4">
      <Card className="w-full max-w-sm gap-0 p-8">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-foreground">
          <Lock className="size-5" />
        </div>
        <h1 className="text-center text-xl font-bold">보건실 관리</h1>
        <p className="mt-1 mb-6 text-center text-sm text-muted-foreground">비밀번호를 입력해 주세요.</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="비밀번호"
            aria-label="비밀번호"
            aria-invalid={!!error}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!password || loading}>
            {loading ? '확인 중…' : '들어가기'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
