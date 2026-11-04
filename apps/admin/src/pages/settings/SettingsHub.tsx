import { Button } from '@/components/ui/button'
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
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>(
    () => TABS.find((t) => window.location.hash.endsWith(`/${t.key}`))?.key ?? 'env',
  )
  const Active = TABS.find((t) => t.key === tab)!.Page

  return (
    <>
      <div className="toolbar" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: 12 }}>
        {TABS.map((t) => (
          <Button key={t.key} variant={tab === t.key ? 'default' : 'outline'} onClick={() => setTab(t.key)}>{t.label}</Button>
        ))}
      </div>
      <Active key={tab} />
    </>
  )
}
