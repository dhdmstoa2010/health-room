import { useEffect, useState, type ComponentType } from 'react'
import { Sidebar } from '@/layout/Sidebar'
import Chronic from '@/pages/students/Chronic'
import Classes from '@/pages/Classes'
import Dashboard from '@/pages/Dashboard'
import HealthLogs from '@/pages/logs/HealthLogs'
import Hospital from '@/pages/students/Hospital'
import Ledger from '@/pages/medicine/Ledger'
import LogsPrint from '@/pages/logs/LogsPrint'
import Purchases from '@/pages/medicine/Purchases'
import Schedule from '@/pages/Schedule'
import SettingsHub from '@/pages/settings/SettingsHub'
import { StatsByClass, StatsBySymptom } from '@/pages/stats/Stats'

const ROUTES: Record<string, ComponentType> = {
  dashboard: Dashboard,
  logs: HealthLogs,
  'logs-print': LogsPrint,
  hospital: Hospital,
  chronic: Chronic,
  purchases: Purchases,
  ledger: Ledger,
  'stats-class': StatsByClass,
  'stats-symptom': StatsBySymptom,
  schedule: Schedule,
  classes: Classes,
  settings: SettingsHub,
}

const currentPath = () => window.location.hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard'

export default function App() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const Page = ROUTES[path] ?? Dashboard

  return (
    <div className="shell">
      <Sidebar path={path} />
      <div className="main">
        <main className="content"><Page key={path} /></main>
      </div>
    </div>
  )
}
