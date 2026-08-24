// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employee-basic-information.tsx

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
import { CountryCombobox } from '@/modules/countries/components/country-combobox'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { UserRound } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
  onClearError: (field: keyof PersonalErrors) => void
}

type Employee = HireEmployeePayload['employee']
type EmployeeErrorField = Extract<keyof Employee, keyof PersonalErrors>
type EmployeeGender = Employee['gender']

export function EmployeeBasicInformation({
  value,
  onChange,
  personalErrors,
  onClearError,
}: Props) {
  const employee = value.employee
  const et = useTranslations('employees')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  function updateEmployee<K extends EmployeeErrorField>(
    field: K,
    fieldValue: Employee[K],
  ) {
    onClearError(field)

    onChange({
      ...value,
      employee: {
        ...employee,
        [field]: fieldValue,
      },
    })
  }

  const errorText = (error?: string) => {
    if (!error) return null

    return <p className='text-xs font-medium text-destructive'>{error}</p>
  }

  return (
    <section className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
      {/* Header */}
      <div className='border-b bg-muted/20 px-5 py-4 sm:px-6'>
        <div className='flex items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm'>
            <UserRound className='size-5 text-muted-foreground' />
          </div>

          <div className='min-w-0'>
            <h3 className='text-base font-semibold tracking-tight sm:text-lg'>
              {et('basicInfo')}
            </h3>

            <p className='mt-0.5 text-sm text-muted-foreground'>
              {et('masterRecord')}
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-6 p-5 sm:p-6'>
        {/* Employee record */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='space-y-2'>
            <Label
              htmlFor='employee-number'
              className={
                personalErrors.employeeNumber ? 'text-destructive' : undefined
              }
            >
              {et('employeeNumberRequired')}
              <span aria-hidden='true' className='ms-1 text-destructive'>
                *
              </span>
            </Label>

            <Input
              id='employee-number'
              className='h-11'
              value={employee.employeeNumber ?? ''}
              aria-invalid={Boolean(personalErrors.employeeNumber)}
              aria-describedby={
                personalErrors.employeeNumber
                  ? 'employee-number-error'
                  : undefined
              }
              onChange={(event) =>
                updateEmployee('employeeNumber', event.target.value)
              }
            />

            {personalErrors.employeeNumber && (
              <div id='employee-number-error'>
                {errorText(personalErrors.employeeNumber)}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label>{et('nationality')}</Label>

            {/* <CountryCombobox
              value={employee.countryId}
              onChange={(country) => {
                onClearError('countryId')
                onChange({
                  ...value,
                  employee: {
                    ...employee,
                    countryId: country.id,
                    countryNameEn: country.name,
                    countryNameAr: country.nameAr,
                  },
                })
              }}
            /> */}
            <CountryCombobox
              value={employee.countryId}
              selectedLabel={
                isRtl
                  ? employee.countryNameAr || employee.countryNameEn
                  : employee.countryNameEn || employee.countryNameAr
              }
              onChange={(country) => {
                onChange({
                  ...value,
                  employee: {
                    ...employee,
                    countryId: country.id,
                    countryNameEn: country.name,
                    countryNameAr: country.nameAr,
                  },
                })

                onClearError?.('countryId')
              }}
            />
          </div>
        </div>

        {/* English name */}
        <div className='rounded-xl border bg-muted/10 p-4 sm:p-5'>
          <div className='mb-4'>
            <h4 className='text-sm font-semibold'>{et('englishName')}</h4>

            <p className='mt-0.5 text-xs text-muted-foreground'>
              {et('englishNameHint')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='first-name-en'
                className={
                  personalErrors.firstNameEn ? 'text-destructive' : undefined
                }
              >
                {et('firstNameEn')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='first-name-en'
                className='h-11'
                value={employee.firstNameEn ?? ''}
                aria-invalid={Boolean(personalErrors.firstNameEn)}
                onChange={(event) =>
                  updateEmployee('firstNameEn', event.target.value)
                }
              />

              {errorText(personalErrors.firstNameEn)}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='second-name-en'>{et('secondNameEn')}</Label>

              <Input
                id='second-name-en'
                className='h-11'
                value={employee.secondNameEn ?? ''}
                onChange={(event) =>
                  updateEmployee('secondNameEn', event.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='third-name-en'>{et('thirdNameEn')}</Label>

              <Input
                id='third-name-en'
                className='h-11'
                value={employee.thirdNameEn ?? ''}
                onChange={(event) =>
                  updateEmployee('thirdNameEn', event.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='family-name-en'
                className={
                  personalErrors.familyNameEn ? 'text-destructive' : undefined
                }
              >
                {et('familyNameEn')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='family-name-en'
                className='h-11'
                value={employee.familyNameEn ?? ''}
                aria-invalid={Boolean(personalErrors.familyNameEn)}
                onChange={(event) =>
                  updateEmployee('familyNameEn', event.target.value)
                }
              />

              {errorText(personalErrors.familyNameEn)}
            </div>
          </div>
        </div>

        {/* Arabic name */}
        <div className='rounded-xl border bg-muted/10 p-4 sm:p-5'>
          <div className='mb-4'>
            <h4 className='text-sm font-semibold'>{et('arabicName')}</h4>

            <p className='mt-0.5 text-xs text-muted-foreground'>
              {et('arabicName')}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='first-name-ar'
                className={
                  personalErrors.firstNameAr ? 'text-destructive' : undefined
                }
              >
                {et('firstNameAr')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='first-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.firstNameAr ?? ''}
                aria-invalid={Boolean(personalErrors.firstNameAr)}
                onChange={(event) =>
                  updateEmployee('firstNameAr', event.target.value)
                }
              />

              {errorText(personalErrors.firstNameAr)}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='second-name-ar'>{et('secondNameAr')}</Label>

              <Input
                id='second-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.secondNameAr ?? ''}
                onChange={(event) =>
                  updateEmployee('secondNameAr', event.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='third-name-ar'>{et('thirdNameAr')}</Label>

              <Input
                id='third-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.thirdNameAr ?? ''}
                onChange={(event) =>
                  updateEmployee('thirdNameAr', event.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='family-name-ar'
                className={
                  personalErrors.familyNameAr ? 'text-destructive' : undefined
                }
              >
                {et('familyNameAr')}
                <span className='ms-1 text-destructive'>*</span>
              </Label>

              <Input
                id='family-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.familyNameAr ?? ''}
                aria-invalid={Boolean(personalErrors.familyNameAr)}
                onChange={(event) =>
                  updateEmployee('familyNameAr', event.target.value)
                }
              />

              {errorText(personalErrors.familyNameAr)}
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='employee-gender'>
              {et('gender')}
              <span className='ms-1 text-destructive'>*</span>
            </Label>

            <div className='h-11'>
              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                value={employee.gender}
                onValueChange={(gender) =>
                  updateEmployee('gender', gender as EmployeeGender)
                }
              >
                <SelectTrigger
                  id='employee-gender'
                  className='w-full data-[size=default]:h-11'
                >
                  <SelectValue placeholder={et('gender')} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='male'>{et('male')}</SelectItem>
                  <SelectItem value='female'>{et('female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='dateOfBirth'
              className={
                personalErrors.dateOfBirth ? 'text-destructive' : undefined
              }
            >
              {et('dateOfBirth')}
              <span className='ms-1 text-destructive'>*</span>
            </Label>

            <DatePicker
              id='dateOfBirth'
              value={employee.dateOfBirth ?? null}
              onChange={(date) => updateEmployee('dateOfBirth', date)}
            />

            {errorText(personalErrors.dateOfBirth)}
          </div>
        </div>
      </div>
    </section>
  )
}
