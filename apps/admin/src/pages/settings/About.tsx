import { Table, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'

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
      <Card  style={{ maxWidth: 560 }}>
        <Table>
          <TableBody>
            {INFO.map(([k, v]) => (
              <TableRow key={k}><TableHead style={{ width: 140 }}>{k}</TableHead><TableCell>{v}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
