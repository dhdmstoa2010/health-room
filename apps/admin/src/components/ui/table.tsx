import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('table w-full border-collapse text-sm', className)} {...props} />
}
export const TableHeader = (p: ComponentProps<'thead'>) => <thead {...p} />
export const TableBody = (p: ComponentProps<'tbody'>) => <tbody {...p} />
export const TableFooter = (p: ComponentProps<'tfoot'>) => <tfoot {...p} />
export const TableRow = (p: ComponentProps<'tr'>) => <tr {...p} />
export const TableHead = (p: ComponentProps<'th'>) => <th {...p} />
export const TableCell = (p: ComponentProps<'td'>) => <td {...p} />
