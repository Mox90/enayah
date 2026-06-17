'use client'

import { format } from 'date-fns'
import { Pencil } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  return (
    <div className='space-y-6'>
      {/* ---------------------------- */}
      {/* Personal Information */}
      {/* ---------------------------- */}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Personal Information</CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <Field label='Employee Number' value={personal.employeeNumber} />

            <Field
              label='Date of Birth'
              value={
                personal.dateOfBirth
                  ? format(new Date(personal.dateOfBirth), 'dd-MMM-yyyy')
                  : '-'
              }
            />

            <Field
              label='Gender'
              value={personal.gender
                ?.replaceAll('_', ' ')
                ?.replace(/\b\w/g, (c: string) => c.toUpperCase())}
            />

            <Field
              label='English Name'
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
              label='Arabic Name'
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
              label='Nationality'
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
          <CardTitle>Country Information</CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Field label='Country' value={personal.nationality?.name} />

            <Field
              label='Nationality'
              value={personal.nationality?.nationalityEn}
            />

            <Field label='ISO Alpha-2' value={personal.nationality?.alpha2} />

            <Field label='ISO Alpha-3' value={personal.nationality?.alpha3} />

            <Field
              label='Numeric Code'
              value={personal.nationality?.numericCode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PersonalTab
