'use client'

import { useTranslations } from 'next-intl'
import { PositionsTable } from './positions-table'
import { CreatePositionDialog } from './create-position-dialog'

export default function JobPositionsPage() {
  const t = useTranslations('positions')
  //const t = await getTranslations('departments')
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{t('positionName')}</h1>

          <p className='text-muted-foreground'>{t('subTitle')}</p>
        </div>

        <CreatePositionDialog />
      </div>

      <PositionsTable />
    </div>
  )
}
