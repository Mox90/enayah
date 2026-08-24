// src/components/icons/saudi-riyal-symbol.tsx

import { cn } from '@/lib/utils'

interface SaudiRiyalSymbolProps {
  className?: string
  /**
   * Optional accessible label for screen readers.
   * Defaults to "Saudi Riyal" if not specified.
   */
  accessibleLabel?: string
  /**
   * Whether to include a screen-reader-only text node.
   * Turn this off if you are handling aria-labels at the input level.
   * @default true
   */
  showAccessibleText?: boolean
}

export function SaudiRiyalSymbol({
  className,
  accessibleLabel = 'Saudi Riyal',
  showAccessibleText = true,
}: SaudiRiyalSymbolProps) {
  return (
    <>
      <span
        aria-hidden='true'
        className={cn('icon-saudi_riyal inline-block leading-none', className)}
      >
        {`\u20C1`}
      </span>
      {showAccessibleText && <span className='sr-only'>{accessibleLabel}</span>}
    </>
  )
}
