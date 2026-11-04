import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function Modal({
  title, onClose, onSubmit, submitLabel = '저장', children,
}: {
  title: string
  onClose: () => void
  onSubmit?: () => void
  submitLabel?: string
  children: ReactNode
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <form
          className="flex min-h-0 flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.()
          }}
        >
          <div className="border-b border-border px-5 py-4"><DialogTitle>{title}</DialogTitle></div>
          <div className="overflow-y-auto p-5">{children}</div>
          <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5">
            <Button type="button" onClick={onClose}>취소</Button>
            {onSubmit && <Button type="submit" variant="default">{submitLabel}</Button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
