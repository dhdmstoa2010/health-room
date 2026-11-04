import { useState } from 'react'
import About from './About'
import Codes from './Codes'
import Settings from './Settings'

const TABS = [
  { key: 'env', label: '환경설정', Page: Settings },
  { key: 'codes', label: '공통코드등록', Page: Codes },
  { key: 'about', label: '프로그램정보', Page: About },
] as const

export default function SettingsHub() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('env')
  const Active = TABS.find((t) => t.key === tab)!.Page

  return (
    <>
      <div className="toolbar" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'btn dark' : 'btn'} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      <Active key={tab} />
    </>
  )
}
