import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-block rounded-md px-2 py-px text-[11px] font-medium', {
  variants: {
    variant: {
      secondary: 'bg-slate-100 text-slate-700',
      default: 'bg-primary text-primary-foreground',
      muted: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'secondary' },
})

export function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
