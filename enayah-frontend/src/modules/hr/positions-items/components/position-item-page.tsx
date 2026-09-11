// enayah-frontend/src/modules/hr/positions-items/components/position-item-page.tsx

'use client'

import { useTranslations } from 'next-intl'

import { CreatePositionItemDialog } from './create-position-item-dialog'
import { PositionItemsTable } from './position-items-table'

export default function PositionItemPage() {
  const t = useTranslations('positionItems')

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>{t('positionItemName')}</h1>

          <p className='text-muted-foreground'>{t('subTitle')}</p>
        </div>

        <CreatePositionItemDialog />
      </div>

      <PositionItemsTable />
    </div>
  )
}
