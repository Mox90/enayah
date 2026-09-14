// enayah-frontend/src/modules/hr/employees/components/onboarding/sections/employee-basic-information.tsx

'use client'

import { DatePicker } from '@/components/dialogs/date-picker'
import { FloatingField } from '@/components/forms/floating-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
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
          {/* <div className='space-y-2'>
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
              // className={cn(
              //   'h-11 rounded-xl bg-background/50 border-border/80 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 focus-visible:bg-background',
              // )}
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
          </div> */}
          <div className='space-y-2'>
            <FloatingField
              id='employee-number'
              label={et('employeeNumberRequired')}
              filled={Boolean(employee.employeeNumber)}
              invalid={Boolean(personalErrors.employeeNumber)}
              required
            >
              <Input
                id='employee-number'
                required
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
            </FloatingField>

            {personalErrors.employeeNumber && (
              <div id='employee-number-error'>
                {errorText(personalErrors.employeeNumber)}
              </div>
            )}
          </div>

          {/* <div className='space-y-2'>
            <Label>{et('nationality')}</Label>
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
          </div> */}
          <div className='space-y-2'>
            <FloatingField
              id='employee-nationality'
              label={et('nationality')}
              filled={Boolean(employee.countryId)}
            >
              <CountryCombobox
                id='employee-nationality'
                hidePlaceholder
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
            </FloatingField>
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
              {/* <Label
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
              /> */}

              <FloatingField
                id='first-name-en'
                label={et('firstNameEn')}
                filled={Boolean(employee.firstNameEn)}
                invalid={Boolean(personalErrors.firstNameEn)}
                required
              >
                <Input
                  id='first-name-en'
                  value={employee.firstNameEn ?? ''}
                  aria-invalid={Boolean(personalErrors.firstNameEn)}
                  aria-describedby={
                    personalErrors.firstNameEn
                      ? 'first-name-en-error'
                      : undefined
                  }
                  onChange={(event) =>
                    updateEmployee('firstNameEn', event.target.value)
                  }
                />
              </FloatingField>

              {personalErrors.firstNameEn && (
                <div id='first-name-en-error'>
                  {errorText(personalErrors.firstNameEn)}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              {/* <Label htmlFor='second-name-en'>{et('secondNameEn')}</Label>

              <Input
                id='second-name-en'
                className='h-11'
                value={employee.secondNameEn ?? ''}
                onChange={(event) =>
                  updateEmployee('secondNameEn', event.target.value)
                }
              /> */}
              <FloatingField
                id='second-name-en'
                label={et('secondNameEn')}
                filled={Boolean(employee.secondNameEn)}
              >
                <Input
                  id='second-name-en'
                  value={employee.secondNameEn ?? ''}
                  onChange={(event) =>
                    updateEmployee('secondNameEn', event.target.value)
                  }
                />
              </FloatingField>
            </div>

            <div className='space-y-2'>
              {/* <Label htmlFor='third-name-en'>{et('thirdNameEn')}</Label>

              <Input
                id='third-name-en'
                className='h-11'
                value={employee.thirdNameEn ?? ''}
                onChange={(event) =>
                  updateEmployee('thirdNameEn', event.target.value)
                }
              /> */}
              <FloatingField
                id='third-name-en'
                label={et('thirdNameEn')}
                filled={Boolean(employee.thirdNameEn)}
              >
                <Input
                  id='third-name-en'
                  value={employee.thirdNameEn ?? ''}
                  onChange={(event) =>
                    updateEmployee('thirdNameEn', event.target.value)
                  }
                />
              </FloatingField>
            </div>

            <div className='space-y-2'>
              {/* <Label
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

              {errorText(personalErrors.familyNameEn)} */}
              <FloatingField
                id='family-name-en'
                label={et('familyNameEn')}
                filled={Boolean(employee.familyNameEn)}
                invalid={Boolean(personalErrors.familyNameEn)}
                required
              >
                <Input
                  id='family-name-en'
                  required
                  value={employee.familyNameEn ?? ''}
                  aria-invalid={Boolean(personalErrors.familyNameEn)}
                  aria-describedby={
                    personalErrors.familyNameEn
                      ? 'family-name-en-error'
                      : undefined
                  }
                  onChange={(event) =>
                    updateEmployee('familyNameEn', event.target.value)
                  }
                />
              </FloatingField>

              {personalErrors.familyNameEn && (
                <div id='family-name-en-error'>
                  {errorText(personalErrors.familyNameEn)}
                </div>
              )}
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
              {/* <Label
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

              {errorText(personalErrors.firstNameAr)} */}
              <FloatingField
                id='first-name-ar'
                label={et('firstNameAr')}
                filled={Boolean(employee.firstNameAr)}
                invalid={Boolean(personalErrors.firstNameAr)}
                required
              >
                <Input
                  id='first-name-ar'
                  required
                  dir='rtl'
                  value={employee.firstNameAr ?? ''}
                  aria-invalid={Boolean(personalErrors.firstNameAr)}
                  aria-describedby={
                    personalErrors.firstNameAr
                      ? 'first-name-ar-error'
                      : undefined
                  }
                  onChange={(event) =>
                    updateEmployee('firstNameAr', event.target.value)
                  }
                />
              </FloatingField>

              {personalErrors.firstNameAr && (
                <div id='first-name-ar-error'>
                  {errorText(personalErrors.firstNameAr)}
                </div>
              )}
            </div>

            <div className='space-y-2'>
              {/* <Label htmlFor='second-name-ar'>{et('secondNameAr')}</Label>

              <Input
                id='second-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.secondNameAr ?? ''}
                onChange={(event) =>
                  updateEmployee('secondNameAr', event.target.value)
                }
              /> */}
              <FloatingField
                id='second-name-ar'
                label={et('secondNameAr')}
                filled={Boolean(employee.secondNameAr)}
              >
                <Input
                  id='second-name-ar'
                  dir='rtl'
                  value={employee.secondNameAr ?? ''}
                  onChange={(event) =>
                    updateEmployee('secondNameAr', event.target.value)
                  }
                />
              </FloatingField>
            </div>

            <div className='space-y-2'>
              {/* <Label htmlFor='third-name-ar'>{et('thirdNameAr')}</Label>

              <Input
                id='third-name-ar'
                className='h-11'
                dir='rtl'
                value={employee.thirdNameAr ?? ''}
                onChange={(event) =>
                  updateEmployee('thirdNameAr', event.target.value)
                }
              /> */}
              <FloatingField
                id='third-name-ar'
                label={et('thirdNameAr')}
                filled={Boolean(employee.thirdNameAr)}
              >
                <Input
                  id='third-name-ar'
                  dir='rtl'
                  value={employee.thirdNameAr ?? ''}
                  onChange={(event) =>
                    updateEmployee('thirdNameAr', event.target.value)
                  }
                />
              </FloatingField>
            </div>

            <div className='space-y-2'>
              {/* <Label
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

              {errorText(personalErrors.familyNameAr)} */}
              <FloatingField
                id='family-name-ar'
                label={et('familyNameAr')}
                filled={Boolean(employee.familyNameAr)}
                invalid={Boolean(personalErrors.familyNameAr)}
                required
              >
                <Input
                  id='family-name-ar'
                  dir='rtl'
                  type='text'
                  value={employee.familyNameAr ?? ''}
                  aria-invalid={Boolean(personalErrors.familyNameAr)}
                  aria-describedby={
                    personalErrors.familyNameAr
                      ? 'family-name-ar-error'
                      : undefined
                  }
                  onChange={(event) =>
                    updateEmployee('familyNameAr', event.target.value)
                  }
                />
              </FloatingField>

              {personalErrors.familyNameAr && (
                <div id='family-name-ar-error'>
                  {errorText(personalErrors.familyNameAr)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='space-y-2'>
            <FloatingField
              id='employee-gender'
              label={et('gender')}
              filled={Boolean(employee.gender)}
              required
            >
              <Select
                dir={isRtl ? 'rtl' : 'ltr'}
                required
                value={employee.gender}
                onValueChange={(gender) =>
                  updateEmployee('gender', gender as EmployeeGender)
                }
              >
                <SelectTrigger
                  id='employee-gender'
                  data-floating-control='true'
                  className='w-full bg-transparent dark:bg-transparent data-[size=default]:h-12'
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='male'>{et('male')}</SelectItem>
                  <SelectItem value='female'>{et('female')}</SelectItem>
                </SelectContent>
              </Select>
            </FloatingField>
          </div>

          <div className='space-y-2'>
            <FloatingField
              id='dateOfBirth'
              label={et('dateOfBirth')}
              filled={Boolean(employee.dateOfBirth)}
              invalid={Boolean(personalErrors.dateOfBirth)}
              required
            >
              <DatePicker
                id='dateOfBirth'
                value={employee.dateOfBirth ?? null}
                hidePlaceholder
                required
                ariaInvalid={Boolean(personalErrors.dateOfBirth)}
                ariaDescribedBy={
                  personalErrors.dateOfBirth ? 'date-of-birth-error' : undefined
                }
                onChange={(date) => updateEmployee('dateOfBirth', date)}
              />
            </FloatingField>
            {personalErrors.dateOfBirth && (
              <div id='date-of-birth-error'>
                {errorText(personalErrors.dateOfBirth)}
              </div>
            )}
          </div>

          {/* <div className='space-y-2'>
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
          </div> */}

          {/* <div className='space-y-2'>
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
          </div> */}
        </div>
      </div>
    </section>
  )
}
