import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
