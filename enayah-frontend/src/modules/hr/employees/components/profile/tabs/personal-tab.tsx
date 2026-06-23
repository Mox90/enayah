'use client'

import { format } from 'date-fns'
import { Pencil } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from 'next-intl'
import { humanize, toArabic } from '@/utils/utilities'

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

  // createdAt: string
  // createdBy: string | null

  // updatedAt: string
  // updatedBy: string | null

  // isDeleted: boolean
  // deletedAt: string | null
  // deletedBy: string | null

  //version: number
  nationality: EmployeeNationality | null
}

interface Props {
  personal: EmployeePersonal
}

interface FieldProps {
  label: string
  value: React.ReactNode
}

function Field({ label, value }: FieldProps) {
  return (
    <div className='space-y-1'>
      <div className='text-xs text-muted-foreground'>{label}</div>

      <div className='font-medium'>{value ?? '-'}</div>
    </div>
  )
}

const PersonalTab = ({ personal }: Props) => {
  const at = useTranslations('auth')
  const et = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <div className='space-y-6'>
      {/* ---------------------------- */}
      {/* Personal Information */}
      {/* ---------------------------- */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>{et('personalInfo')}</CardTitle>

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
            />

            <Field
              label={et('nationality')}
              value={personal.nationality?.nationalityEn}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------- */}
      {/* Country */}
      {/* ---------------------------- */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>{et('countryInfo')}</CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Field label={et('country')} value={personal.nationality?.name} />

            <Field
              label={et('country')}
              value={personal.nationality?.nationalityEn}
            />

            <Field label={et('alpha2')} value={personal.nationality?.alpha2} />

            <Field label={et('alpha3')} value={personal.nationality?.alpha3} />

            <Field
              label={et('numericCode')}
              value={personal.nationality?.numericCode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PersonalTab
