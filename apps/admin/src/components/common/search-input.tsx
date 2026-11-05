import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function SearchInput({ wrapperClassName, className, ...props }: ComponentProps<typeof Input> & { wrapperClassName?: string }) {
  return (
    <div className={cn('relative w-full max-w-sm', wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" className={cn('pl-9', className)} {...props} />
    </div>
  )
}
