import { formatVisitTime, type Visit } from '@health-room/shared'
import { Button } from '@health-room/ui'
import { useState } from 'react'

function App() {
  const [visit, setVisit] = useState<Visit | null>(null)

  const handleVisit = () =>
    setVisit({
      id: 1,
      studentName: '은샘',
      symptom: '어지러움',
      visitedAt: new Date().toISOString(),
    })

  return (
    <main style={{ padding: 24 }}>
      <h1>보건실 (유저)</h1>
      <Button onClick={handleVisit}>보건실 방문 기록하기</Button>
      {visit && (
        <p>
          {visit.studentName} · {visit.symptom} · {formatVisitTime(visit.visitedAt)}
        </p>
      )}
    </main>
  )
}

export default App
