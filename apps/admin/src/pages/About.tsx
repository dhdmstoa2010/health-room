import { PageHeader } from '../ui'

const INFO: [string, string][] = [
  ['프로그램명', '보건일지관리시스템 (어드민)'],
  ['버전', '0.1.0'],
  ['제작사', 'health-room'],
  ['사용 권한', 'ADMIN'],
  ['빌드 환경', 'React · Vite · TypeScript'],
]

export default function About() {
  return (
    <>
      <PageHeader title="프로그램정보" desc="버전·제작사 정보" />
      <div className="card" style={{ maxWidth: 560 }}>
        <table className="table">
          <tbody>
            {INFO.map(([k, v]) => (
              <tr key={k}><th style={{ width: 140 }}>{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
