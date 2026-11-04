import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary/15 disabled:opacity-50'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(base, 'min-h-[72px] resize-y', className)} {...props} />
}

export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(base, 'input appearance-none pr-9', className)} {...props} />
}
