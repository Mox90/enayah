'use client'

import { format } from 'date-fns'
import {
  Calendar,
  Earth,
  Globe,
  Hash,
  IdCard,
  IdCardLanyard,
  Layers,
  Pencil,
  User,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from 'next-intl'
import { humanize, toArabic, toPersianDigits } from '@/utils/utilities'
import { useEmployeePersonal } from '../../../hooks/use-employee-personal-details'
import { PersonalDetailsCards } from './cards/personal-details'
import { Skeleton } from '@/components/ui/skeleton'

export type Gender = 'male' | 'female'

export interface EmployeeNationality {
  id: string
  name: string
  nameAr: string | null
  nationalityEn: string
  nationalityAr: string | null
  alpha2: string
  alpha3: string
  numericCode: string
}

export interface EmployeePersonal {
  id: string

  employeeNumber: string

  firstNameEn: string
  secondNameEn: string | null
  thirdNameEn: string | null
  familyNameEn: string

  firstNameAr: string
  secondNameAr: string | null
  thirdNameAr: string | null
  familyNameAr: string

  dateOfBirth: string | null

  gender: Gender

  countryId?: string

  nationality: EmployeeNationality | null
}

interface Props {
  personal: EmployeePersonal
}

interface FieldProps {
  label: string
  value: React.ReactNode
  isRtl?: boolean
}

function Field({ label, value, isRtl = false }: FieldProps) {
  return (
    <div className='space-y-1'>
      <div className='text-xs text-muted-foreground'>{label}</div>

      <div className={isRtl ? '' : 'font-medium'}>{value ?? '-'}</div>
    </div>
  )
}

const PersonalTab = ({ personal }: Props) => {
  const at = useTranslations('auth')
  const et = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const { data: personalDetails, isLoading } = useEmployeePersonal(personal.id)

  return (
    <div className='space-y-6'>
      {/* ---------------------------- */}
      {/* Personal Information */}
      {/* ---------------------------- */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <IdCardLanyard className='h-5 w-5' />
            {et('personalInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <Field
              label={at('employeeNumber')}
              value={personal.employeeNumber}
            />

            <Field
              label={et('dateOfBirth')}
              value={
                personal.dateOfBirth
                  ? isRtl
                    ? toArabic(personal.dateOfBirth, 1)
                    : format(new Date(personal.dateOfBirth), 'dd-MMM-yyyy')
                  : '-'
              }
            />

            <Field label={et('gender')} value={et(personal.gender)} />

            <Field
              label={et('englishName')}
              value={[
                personal.firstNameEn,
                personal.secondNameEn,
                personal.thirdNameEn,
                personal.familyNameEn,
              ]
                .filter(Boolean)
                .join(' ')}
            />

            <Field
              label={et('arabicName')}
              value={[
                personal.firstNameAr,
                personal.secondNameAr,
                personal.thirdNameAr,
                personal.familyNameAr,
              ]
                .filter(Boolean)
                .join(' ')}
              isRtl
            />

            <Field
              label={et('nationality')}
              value={
                isRtl
                  ? (personal.nationality?.nationalityAr ??
                    personal.nationality?.nationalityEn)
                  : personal.nationality?.nationalityEn
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------- */}
      {/* Country */}
      {/* ---------------------------- */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Earth className='h-5 w-5' />
            {et('countryInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Field
              label={et('country')}
              value={
                isRtl
                  ? (personal.nationality?.nameAr ?? personal.nationality?.name)
                  : personal.nationality?.name
              }
            />

            <Field
              label={et('nationality')}
              value={
                isRtl
                  ? (personal.nationality?.nationalityAr ??
                    personal.nationality?.nationalityEn)
                  : personal.nationality?.nationalityEn
              }
            />

            <Field label={et('alpha2')} value={personal.nationality?.alpha2} />

            <Field label={et('alpha3')} value={personal.nationality?.alpha3} />

            <Field
              label={et('numericCode')}
              value={
                isRtl
                  ? toPersianDigits(personal.nationality?.numericCode)
                  : personal.nationality?.numericCode
              }
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className='text-sm text-muted-foreground'>
          Loading personal details...
        </div>
      ) : (
        <PersonalDetailsCards personalDetails={personalDetails} />
      )}
    </div>
  )
}

export default PersonalTab
