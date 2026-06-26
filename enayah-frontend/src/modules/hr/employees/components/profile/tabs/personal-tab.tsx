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
import {
  useEmployeePersonal,
  useEmployeePersonalMutations,
} from '../../../hooks/use-employee-personal-details'
import { PersonalDetailsCards } from './cards/personal-details'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { EmployeePersonalDetails } from '../../../types/employee-personal-details.types'
import { useState } from 'react'

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
  icon?: React.ReactNode
  isRtl?: boolean
}

function Field({ label, value, icon, isRtl = false }: FieldProps) {
  return (
    <div className='rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30'>
      <div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground'>
        {icon}
        {label}
      </div>

      <div className={cn('font-medium text-foreground', isRtl && 'text-right')}>
        {value ?? '-'}
      </div>
    </div>
  )
}

const PersonalTab = ({ personal }: Props) => {
  const at = useTranslations('auth')
  const et = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const {
    data: personalDetails,
    isLoading,
    error,
  } = useEmployeePersonal(personal.id)
  const [identificationDialogOpen, setIdentificationDialogOpen] =
    useState(false)
  const [editingIdentification, setEditingIdentification] = useState<
    EmployeePersonalDetails['identifications'][number] | null
  >(null)

  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<
    EmployeePersonalDetails['addresses'][number] | null
  >(null)

  const [visaDialogOpen, setVisaDialogOpen] = useState(false)
  const [editingVisa, setEditingVisa] = useState<
    EmployeePersonalDetails['visas'][number] | null
  >(null)

  const employeePersonal = useEmployeePersonalMutations(personal.id)

  return (
    <div className='space-y-6'>
      {/* ---------------------------- */}
      {/* Personal Information */}
      {/* ---------------------------- */}

      <Card className='transition-all duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-rose-400'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl '>
              {/* <IdCardLanyard className='h-5 w-5' /> */}
              <span className='text-3xl'>🪪</span>
            </div>
            {et('personalInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
            <Field
              icon={<Hash className='h-3.5 w-3.5' />}
              label={at('employeeNumber')}
              value={personal.employeeNumber}
            />

            <Field
              icon={<Calendar className='h-3.5 w-3.5' />}
              label={et('dateOfBirth').replace('*', '')}
              value={
                personal.dateOfBirth
                  ? isRtl
                    ? toArabic(personal.dateOfBirth, 1)
                    : format(new Date(personal.dateOfBirth), 'dd-MMM-yyyy')
                  : '-'
              }
            />

            <Field
              icon={<User className='h-3.5 w-3.5' />}
              label={et('gender')}
              value={et(personal.gender)}
            />

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

      <Card className='transition-all duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-blue-600'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl'>
              {/* <Earth className='h-5 w-5' /> */}
              <span className='text-3xl'>🌏</span>
            </div>
            {et('countryInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>
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
          <Card className='transition-all duration-200 hover:shadow-md'>
            <CardHeader>
              <Skeleton className='h-6 w-56' />
            </CardHeader>

            <CardContent className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-20 rounded-xl' />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className='text-sm text-destructive'>
          Failed to load personal details. Please try again.
        </div>
      ) : (
        // <PersonalDetailsCards personalDetails={personalDetails} />
        <PersonalDetailsCards
          personalDetails={personalDetails}
          onAddIdentification={() => {
            setEditingIdentification(null)
            setIdentificationDialogOpen(true)
          }}
          onEditIdentification={(id) => {
            const item = personalDetails?.identifications.find(
              (x) => x.id === id,
            )
            if (!item) return

            setEditingIdentification(item)
            setIdentificationDialogOpen(true)
          }}
          onDeleteIdentification={(id) => {
            employeePersonal.deleteIdentification.mutate(id)
          }}
          onAddAddress={() => {
            setEditingAddress(null)
            setAddressDialogOpen(true)
          }}
          onEditAddress={(id) => {
            const item = personalDetails?.addresses.find((x) => x.id === id)
            if (!item) return

            setEditingAddress(item)
            setAddressDialogOpen(true)
          }}
          onDeleteAddress={(id) => {
            employeePersonal.deleteAddress.mutate(id)
          }}
          onAddVisa={() => {
            setEditingVisa(null)
            setVisaDialogOpen(true)
          }}
          onEditVisa={(id) => {
            const item = personalDetails?.visas.find((x) => x.id === id)
            if (!item) return

            setEditingVisa(item)
            setVisaDialogOpen(true)
          }}
          onDeleteVisa={(id) => {
            employeePersonal.deleteVisa.mutate(id)
          }}
        />
      )}
    </div>
  )
}

export default PersonalTab
