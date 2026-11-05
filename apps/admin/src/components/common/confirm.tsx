import { useState, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

type Options = { title?: string; confirmLabel?: string }

export function useConfirm() {
  const [state, setState] = useState<({ message: string; onConfirm: () => void } & Options) | null>(null)

  const ask = (message: string, onConfirm: () => void, options: Options = {}) => setState({ message, onConfirm, ...options })

  const dialog: ReactNode = state && (
    <Dialog open onOpenChange={(open) => !open && setState(null)}>
      <DialogContent showCloseButton={false} className="items-center gap-0 px-6 pb-5 pt-6 text-center sm:max-w-sm">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </div>
        <DialogTitle className="text-base leading-tight">{state.title ?? '삭제하시겠습니까?'}</DialogTitle>
        <DialogDescription className="mt-1 text-sm font-medium leading-snug text-foreground">{state.message}</DialogDescription>
        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setState(null)}>취소</Button>
          <Button
            variant="destructive"
            onClick={() => {
              state.onConfirm()
              setState(null)
            }}
          >
            {state.confirmLabel ?? '삭제'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return { ask, dialog }
}
