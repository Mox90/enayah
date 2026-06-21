'use client'

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
import { CountryLookup } from '@/modules/countries/components/country-lookup'
import { PersonalErrors } from '@/modules/hr/onboarding/types/onboarding-errors.types'
import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { useTranslations } from 'next-intl'
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
}

type Employee = HireEmployeePayload['employee']
type EmployeeGender = Employee['gender'] //HireEmployeePayload['employee']['gender']

export function EmployeeBasicInformation({
  value,
  onChange,
  personalErrors,
}: Props) {
  const employee = value.employee
  const et = useTranslations('employees')

  function updateEmployee<K extends keyof Employee>(
    field: K,
    fieldValue: Employee[K],
  ) {
    onChange({
      ...value,
      employee: {
        ...employee,
        [field]: fieldValue,
      },
    })
  }

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold'>{et('basicInfo')}</h3>
        <p className='text-sm text-muted-foreground'>{et('masterRecord')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label
            className={`${personalErrors.employeeNumber ? 'text-destructive' : ''}`}
          >
            {et('employeeNumberRequired')}
          </Label>
          <Input
            value={employee.employeeNumber ?? ''}
            onChange={(e) => updateEmployee('employeeNumber', e.target.value)}
          />
          {personalErrors.employeeNumber && (
            <p className='text-sm text-destructive'>
              {personalErrors.employeeNumber}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{et('nationality')}</Label>
          {/* <CountryCombobox
            value={employee.countryId}
            onChange={(id) => updateEmployee('countryId', id)}
          /> */}
          <CountryCombobox
            value={employee.countryId}
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
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.firstNameEn ? 'text-destructive' : ''}`}
          >
            {et('firstNameEn')}
          </Label>
          <Input
            value={employee.firstNameEn ?? ''}
            onChange={(e) => updateEmployee('firstNameEn', e.target.value)}
          />
          {personalErrors.firstNameEn && (
            <p className='text-sm text-destructive'>
              {personalErrors.firstNameEn}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{et('secondNameEn')}</Label>
          <Input
            value={employee.secondNameEn ?? ''}
            onChange={(e) => updateEmployee('secondNameEn', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>{et('thirdNameEn')}</Label>
          <Input
            value={employee.thirdNameEn ?? ''}
            onChange={(e) => updateEmployee('thirdNameEn', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.familyNameEn ? 'text-destructive' : ''}`}
          >
            {et('familyNameEn')}
          </Label>
          <Input
            value={employee.familyNameEn ?? ''}
            onChange={(e) => updateEmployee('familyNameEn', e.target.value)}
          />
          {personalErrors.familyNameEn && (
            <p className='text-sm text-destructive'>
              {personalErrors.familyNameEn}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.firstNameAr ? 'text-destructive' : ''}`}
          >
            {et('firstNameAr')}
          </Label>
          <Input
            value={employee.firstNameAr ?? ''}
            onChange={(e) => updateEmployee('firstNameAr', e.target.value)}
            dir='rtl'
          />
          {personalErrors.firstNameAr && (
            <p className='text-sm text-destructive'>
              {personalErrors.firstNameAr}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{et('secondNameAr')}</Label>
          <Input
            value={employee.secondNameAr ?? ''}
            onChange={(e) => updateEmployee('secondNameAr', e.target.value)}
            dir='rtl'
          />
        </div>

        <div className='space-y-2'>
          <Label>{et('thirdNameAr')}</Label>
          <Input
            value={employee.thirdNameAr ?? ''}
            onChange={(e) => updateEmployee('thirdNameAr', e.target.value)}
            dir='rtl'
          />
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.familyNameAr ? 'text-destructive' : ''}`}
          >
            {et('familyNameAr')}
          </Label>
          <Input
            value={employee.familyNameAr ?? ''}
            onChange={(e) => updateEmployee('familyNameAr', e.target.value)}
            dir='rtl'
          />
          {personalErrors.familyNameAr && (
            <p className='text-sm text-destructive'>
              {personalErrors.familyNameAr}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{et('gender')}</Label>
          <Select
            value={employee.gender}
            onValueChange={(v) => updateEmployee('gender', v as EmployeeGender)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select gender' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='male'>{et('male')}</SelectItem>
              <SelectItem value='female'>{et('female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{et('dateOfBirth')}</Label>
          <Input
            type='date'
            value={employee.dateOfBirth ?? ''}
            onChange={(e) => updateEmployee('dateOfBirth', e.target.value)}
          />
        </div>
      </div>
    </section>
  )
}
