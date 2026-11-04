import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn('fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-48px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-background shadow-xl', className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground" aria-label="닫기">
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title className={cn('text-base font-semibold', className)} {...props} />
)
export const DialogDescription = DialogPrimitive.Description
