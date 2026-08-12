import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

export function CurrentBadge({ label }: { label: string }) {
  return (
    <Badge
      variant='secondary'
      className='flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
      //className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 shadow-sm dark:text-emerald-400'
    >
      <Check className='h-3 w-3 shrink-0' aria-hidden='true' />
      <span>{label}</span>
    </Badge>
  )
}
