'use client'

import { DatePicker } from '@/components/dialogs/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  HireEmployeePayload,
  IdentificationInput,
} from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function EmployeeIdentificationInformation({ value, onChange }: Props) {
  const t = useTranslations('employees')
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const identification = value.personal?.identifications?.[0]

  function updateIdentification<K extends keyof IdentificationInput>(
    field: K,
    fieldValue: IdentificationInput[K],
  ) {
    const nextIdentification = {
      type: identification?.type ?? 'iqama',
      identificationNumber: identification?.identificationNumber ?? '',
      issueDate: identification?.issueDate ?? null,
      expiryDate: identification?.expiryDate ?? null,
      isCurrent: true,
      ...identification,
      [field]: fieldValue,
    }

    onChange({
      ...value,
      personal: {
        ...value.personal,
        // identifications: nextIdentification.identificationNumber
        //   ? [nextIdentification]
        //   : [],
        identifications: [nextIdentification],
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>{t('identification')}</h3>
        <p className='text-sm text-muted-foreground'>
          {t('identificationInfo')}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>{t('idType')}</Label>
          <Select
            dir={isRtl ? 'rtl' : 'ltr'}
            value={identification?.type ?? 'iqama'}
            onValueChange={(v) =>
              updateIdentification('type', v as IdentificationInput['type'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='national_id'>{t('national_id')}</SelectItem>
              <SelectItem value='iqama'>{t('iqama')}</SelectItem>
              <SelectItem value='gcc_id'>{t('gcc_id')}</SelectItem>
              <SelectItem value='passport'>{t('passport')}</SelectItem>
              <SelectItem value='other'>{t('other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{t('idNumber')}</Label>
          <Input
            value={identification?.identificationNumber ?? ''}
            onChange={(e) =>
              updateIdentification('identificationNumber', e.target.value)
            }
          />
        </div>

        <div className='space-y-2'>
          {/* <Label>{ct('issueDate')}</Label>
          <Input
            type='date'
            value={identification?.issueDate ?? ''}
            onChange={(e) =>
              updateIdentification('issueDate', e.target.value || null)
            }
          /> */}
          <label
            htmlFor={'issueDate'}
            className='text-xs text-muted-foreground block'
          >
            {ct('issueDate')}
          </label>

          <DatePicker
            id='issueDate'
            value={identification?.issueDate ?? ''}
            onChange={(value) =>
              updateIdentification('issueDate', value ?? null)
            }
          />
        </div>

        <div className='space-y-2'>
          {/* <Label>{ct('expiryDate')}</Label>
          <Input
            type='date'
            value={identification?.expiryDate ?? ''}
            onChange={(e) =>
              updateIdentification('expiryDate', e.target.value || null)
            }
          /> */}
          <label
            htmlFor={'expiryDate'}
            className='text-xs text-muted-foreground block'
          >
            {ct('expiryDate')}
          </label>

          <DatePicker
            id='expiryDate'
            value={identification?.expiryDate ?? ''}
            onChange={(value) =>
              updateIdentification('expiryDate', value ?? null)
            }
          />
        </div>
      </div>
    </section>
  )
}
