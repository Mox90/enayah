// enayah-frontend/src/modules/hr/dashboard/components/hr-admin/turnover/monthly-turnover-panel.tsx

'use client'

import { useTranslations } from 'next-intl'

interface QuarterlyTurnoverPanelProps {
  year: number
  quarter: number
}

const QuarterlyTurnoverPanel = ({
  year,
  quarter,
}: QuarterlyTurnoverPanelProps) => {
  const t = useTranslations('hrDashboard.admin')

  return (
    <div className='space-y-6'>
      {/* ==================================
          HEADING
      ================================== */}

      <div>
        <h2 className='text-xl font-semibold'>
          {t('staffTurnover.quarterly.title')}
        </h2>

        <p className='text-sm text-muted-foreground'>
          {t('staffTurnover.quarterly.description')}
        </p>
      </div>

      {/* ==================================
          PLACEHOLDER

          Replace this once the quarterly
          backend endpoint is implemented.
      ================================== */}

      <div className='flex min-h-[420px] items-center justify-center rounded-2xl border bg-[#ffeff6] p-6 shadow-sm dark:bg-muted/30'>
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            {t('staffTurnover.quarterly.comingSoon')}
          </p>

          <p className='mt-2 text-xs text-muted-foreground'>
            {t('staffTurnover.quarterly.selectedPeriod', {
              quarter,
              year,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuarterlyTurnoverPanel
