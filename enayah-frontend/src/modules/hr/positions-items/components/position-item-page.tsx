'use client'

import { useTranslations } from 'next-intl'
import { PositionItemsTable } from './position-items-table'

export default function PositionItemPage() {
  const t = useTranslations('positionItems')

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{t('positionItemName')}</h1>

          <p className='text-muted-foreground'>{t('subTitle')}</p>
        </div>

        {/* <CreatePositionItemDialog /> */}
      </div>

      <PositionItemsTable />
    </div>
  )
}
