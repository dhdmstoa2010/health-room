import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export type ConfirmRow = { label: string; value: string; onEdit?: () => void }

/** 다음 단계로 넘어가기 전 입력 내용을 한 번 더 확인시키는 모달. 각 항목에서 바로 수정으로 돌아갈 수 있다. */
export function ConfirmDialog({
  open,
  title,
  description,
  rows,
  confirmLabel,
  cancelLabel,
  loading,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  rows: ConfirmRow[]
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !loading && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-w-md">
        <div className="border-b px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
        </div>
        <dl className="m-0 divide-y px-5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-4 py-3">
              <dt className="w-12 shrink-0 text-sm text-muted-foreground">{r.label}</dt>
              <dd className="m-0 min-w-0 flex-1 break-words font-medium">{r.value}</dd>
              {r.onEdit && (
                <Button variant="ghost" size="sm" onClick={r.onEdit} disabled={loading}>
                  수정
                </Button>
              )}
            </div>
          ))}
        </dl>
        {error && <p className="px-5 pb-1 text-sm text-destructive" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 border-t px-5 py-3.5">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? '처리 중…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
