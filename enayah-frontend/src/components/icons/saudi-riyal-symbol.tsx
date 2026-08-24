// src/components/icons/saudi-riyal-symbol.tsx

import { cn } from '@/lib/utils'

interface SaudiRiyalSymbolProps {
  className?: string
}

export function SaudiRiyalSymbol({ className }: SaudiRiyalSymbolProps) {
  return (
    <span
      aria-hidden='true'
      // className={cn('icon-saudi_riyal inline-block leading-none', className)}
      className={cn('inline-block leading-none', className)}
    >
      {/* &#xea; */}
      {`\u20C1`}
    </span>
  )
}
