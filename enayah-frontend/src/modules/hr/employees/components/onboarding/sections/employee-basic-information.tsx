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
//import { HireEmployeePayload } from '../types/hire.types'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
  personalErrors: PersonalErrors
}

export function EmployeeBasicInformation({
  value,
  onChange,
  personalErrors,
}: Props) {
  const employee = value.employee

  function updateEmployee(field: keyof typeof employee, fieldValue: any) {
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
        <h3 className='text-lg font-semibold'>Basic Information</h3>
        <p className='text-sm text-muted-foreground'>
          Employee master record information.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label
            className={`${personalErrors.employeeNumber ? 'text-destructive' : ''}`}
          >
            Employee Number *
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
          <Label>Nationality / Country ID</Label>
          <CountryCombobox
            value={employee.countryId}
            onChange={(id) => updateEmployee('countryId', id)}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.firstNameEn ? 'text-destructive' : ''}`}
          >
            First Name EN *
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
          <Label
            className={`${personalErrors.familyNameEn ? 'text-destructive' : ''}`}
          >
            Family Name EN *
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
          <Label>Second Name EN</Label>
          <Input
            value={employee.secondNameEn ?? ''}
            onChange={(e) => updateEmployee('secondNameEn', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label>Third Name EN</Label>
          <Input
            value={employee.thirdNameEn ?? ''}
            onChange={(e) => updateEmployee('thirdNameEn', e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className={`${personalErrors.firstNameAr ? 'text-destructive' : ''}`}
          >
            First Name AR *
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
          <Label
            className={`${personalErrors.familyNameAr ? 'text-destructive' : ''}`}
          >
            Family Name AR *
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
          <Label>Second Name AR</Label>
          <Input
            value={employee.secondNameAr ?? ''}
            onChange={(e) => updateEmployee('secondNameAr', e.target.value)}
            dir='rtl'
          />
        </div>

        <div className='space-y-2'>
          <Label>Third Name AR</Label>
          <Input
            value={employee.thirdNameAr ?? ''}
            onChange={(e) => updateEmployee('thirdNameAr', e.target.value)}
            dir='rtl'
          />
        </div>

        <div className='space-y-2'>
          <Label>Gender</Label>
          <Select
            value={employee.gender}
            onValueChange={(v) => updateEmployee('gender', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select gender' />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value='male'>Male</SelectItem>
              <SelectItem value='female'>Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Date of Birth</Label>
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
