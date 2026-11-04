import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-slate-800',
        outline: 'border border-input bg-background hover:bg-muted',
        destructive: 'border border-input bg-background text-destructive hover:bg-muted',
        ghost: 'hover:bg-muted',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-7 px-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
)

export function Button({
  className, variant, size, asChild = false, ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
