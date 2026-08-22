// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/onboarding-form-section.tsx

import type { ReactNode } from 'react'

interface Props {
  title: string
  description?: string
  badge?: string
  children: ReactNode
}

export function OnboardingFormSection({
  title,
  description,
  badge,
  children,
}: Props) {
  return (
    <div className='overflow-hidden rounded-xl border bg-card shadow-sm'>
      <div className='border-b bg-muted/20 px-5 py-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h4 className='text-sm font-semibold tracking-tight'>{title}</h4>

            {description && (
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            )}
          </div>

          {badge && (
            <span className='shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className='p-5'>{children}</div>
    </div>
  )
}
