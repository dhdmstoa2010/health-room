import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div data-card className={cn('rounded-2xl border border-border bg-background p-5 shadow-sm', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cn('mb-3 text-[15px] font-semibold', className)} {...props} />
}
