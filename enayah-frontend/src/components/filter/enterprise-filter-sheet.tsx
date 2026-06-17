'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { EnterpriseFilterConfig } from './enterprise-filter-types'
import { EnterpriseFilterGroup } from './enterprise-filter-group'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type EnterpriseFilterValues = Record<string, string[]>
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: EnterpriseFilterConfig[]
  values: EnterpriseFilterValues
  onApply: (values: EnterpriseFilterValues) => void
  onReset: () => void
}

export function EnterpriseFilterSheet({
  open,
  onOpenChange,
  config,
  values,
  //onChange,
  onApply,
  onReset,
}: Props) {
  const [localValues, setLocalValues] = useState(values)
  const t = useTranslations('common')

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setLocalValues(values)
        }
        onOpenChange(next)
      }}
    >
      <SheetContent className='w-[420px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className='space-y-8 mt-6'>
          {config.map((item) => (
            <EnterpriseFilterGroup
              key={item.key}
              config={item}
              values={localValues[item.key] ?? []}
              onChange={(v) =>
                setLocalValues((prev) => ({
                  ...prev,

                  [item.key]: v,
                }))
              }
            />
          ))}
        </div>

        <div className='flex gap-3 mt-8'>
          <Button variant='outline' onClick={onReset}>
            {t('reset')}
          </Button>

          <Button
            onClick={() => {
              onApply(localValues)
              onOpenChange(false)
            }}
          >
            {t('apply')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
