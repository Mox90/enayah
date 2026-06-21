'use client'

import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
import { useLocale, useTranslations } from 'next-intl'
import { humanize } from '@/utils/utilities'

interface Props {
  value: HireEmployeePayload
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='font-medium'>{value || '-'}</div>
    </div>
  )
}

function formatDate(value?: string | null) {
  return value ? format(new Date(value), 'dd-MMM-yyyy') : '-'
}

export function ReviewStep({ value }: Props) {
  console.log(value)
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const employee = value.employee
  const employment = value.employment
  const contract = value.contract
  const movement = value.movement
  const appointment = value.appointment
  const compensation = value.compensation
  const allowances = value.allowances ?? []
  const credentials = value.credentials
  const at = useTranslations('allowanceTypes')

  const fullNameEn = [
    employee.firstNameEn,
    employee.secondNameEn,
    employee.thirdNameEn,
    employee.familyNameEn,
  ]
    .filter(Boolean)
    .join(' ')

  const fullNameAr = [
    employee.firstNameAr,
    employee.secondNameAr,
    employee.thirdNameAr,
    employee.familyNameAr,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Field label='Employee Number' value={employee.employeeNumber} />
          <Field label='English Name' value={fullNameEn} />
          <Field label='Arabic Name' value={fullNameAr} />
          <Field label='Gender' value={humanize(employee.gender)} />
          <Field
            label='Date of Birth'
            value={formatDate(employee.dateOfBirth)}
          />
          <Field
            label='Nationality / Country ID'
            value={
              isRtl
                ? (employee.countryNameAr ?? employee.countryNameEn ?? '-')
                : (employee.countryNameEn ?? '-')
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment & Assignment</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Field label='Hire Date' value={formatDate(employment.hireDate)} />
          <Field label='Start Date' value={formatDate(employment.startDate)} />
          <Field label='End Date' value={formatDate(employment.endDate)} />
          <Field
            label='Employment Type'
            value={humanize(employment.employmentType)}
          />
          <Field
            label='Staff Category'
            value={humanize(employment.staffCategory)}
          />

          <Field
            label='Contract Start'
            value={formatDate(contract.startDate)}
          />
          <Field label='Contract End' value={formatDate(contract.endDate)} />
          <Field
            label='Contract Type'
            value={humanize(contract.contractType)}
          />
          <Field label='Contract Status' value={humanize(contract.status)} />

          <Field
            label='Position Item / PCN'
            value={movement.itemNumber ?? movement.positionItemId}
          />
          <Field
            label='Actual Department'
            value={
              appointment?.actualDepartmentNameEn ??
              appointment?.actualDepartmentId
            }
          />
          <Field
            label='Actual Position'
            value={
              appointment?.actualPositionTitleEn ??
              appointment?.actualPositionId
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {compensation ? (
            <>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <Field
                  label='Effective Date'
                  value={formatDate(compensation.effectiveDate)}
                />
                <Field
                  label='Base Salary'
                  value={compensation.baseSalary.toLocaleString()}
                />
                <Field label='Status' value={humanize(compensation.status)} />
                <Field label='Reason' value={compensation.reason} />
              </div>

              <div className='space-y-2'>
                <div className='font-medium'>Allowances</div>

                {allowances.length === 0 ? (
                  <div className='text-sm text-muted-foreground'>
                    No allowances added.
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {allowances.map((allowance, index) => (
                      <div
                        key={`${allowance.type}-${index}`}
                        className='flex items-center justify-between rounded-md border p-3'
                      >
                        <span>
                          {typeof allowance.type === 'string'
                            ? at.has(allowance.type)
                              ? at(allowance.type)
                              : allowance.type
                            : allowance.type}
                        </span>
                        <span className='font-medium'>
                          {allowance.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              No compensation details added.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
          <Badge variant='secondary'>
            Degrees: {credentials?.degrees?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Boards: {credentials?.boards?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Fellowships: {credentials?.fellowships?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Memberships: {credentials?.memberships?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Licenses: {credentials?.licenses?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Life Support: {credentials?.lifeSupport?.length ?? 0}
          </Badge>

          <Badge variant='secondary'>
            Malpractice: {credentials?.malpractice?.length ?? 0}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
