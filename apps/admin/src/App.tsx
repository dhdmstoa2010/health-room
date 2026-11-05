import { useEffect, useState, type ComponentType } from 'react'
import { Sidebar } from '@/layout/Sidebar'
import { useAuthed } from '@/lib/auth'
import Login from '@/pages/Login'
import Chronic from '@/pages/students/Chronic'
import Classes from '@/pages/Classes'
import Dashboard from '@/pages/Dashboard'
import HealthLogs from '@/pages/health-log/HealthLogs'
import Hospital from '@/pages/students/Hospital'
import Ledger from '@/pages/medicine/Ledger'
import LogsPrint from '@/pages/health-log/LogsPrint'
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
  const authed = useAuthed()
  return authed ? <AdminShell /> : <Login />
}

function AdminShell() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => setMenuOpen(false), [path])

  const Page = ROUTES[path] ?? Dashboard

  return (
    <div className="shell">
      <Sidebar path={path} open={menuOpen} />
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button type="button" className="menu-btn" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <b>보건실 관리</b>
        </header>
        <main className="content"><Page key={path} /></main>
      </div>
    </div>
  )
}
