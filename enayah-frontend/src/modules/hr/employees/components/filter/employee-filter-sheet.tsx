'use client'

import { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'

//import { DepartmentLookup } from '@/modules/org/departments/components/department-lookup'
// import { PositionLookup } from '@/modules/org/positions/components/position-lookup'
// import { CountryLookup } from '@/modules/master/countries/components/country-lookup'

import { EnterpriseFilterCheckboxGroup } from '@/components/filter/enterprise-filter-checkbox-group'
import { DepartmentLookup } from '@/modules/hr/departments/components/department-lookup'
import { PositionLookup } from '@/modules/hr/positions/components/position-lookup'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/dialogs/date-picker'
import { useTranslations } from 'next-intl'

interface EmployeeFilters {
  departmentIds: string[]
  positionIds: string[]
  categoryCodes: number[]
  genders: string[]
  nationalities: string[]
  employmentStatuses: string[]

  hireDateFrom?: string
  hireDateTo?: string

  contractEndDateFrom?: string
  contractEndDateTo?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: EmployeeFilters
  onApply: (filters: EmployeeFilters) => void
  onReset: () => void
}

export function EmployeeFilterSheet({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
}: Props) {
  const [local, setLocal] = useState<EmployeeFilters>({ ...values })
  const et = useTranslations('employees')
  const ct = useTranslations('common')

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setLocal(values)
        }

        onOpenChange(o)
      }}
    >
      <SheetContent className=' w-[450px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{et('filterEmployees')}</SheetTitle>
        </SheetHeader>

        <div className='space-y-8 mt-6 mx-4'>
          <DepartmentLookup
            value={local.departmentIds}
            onChange={(departmentIds) =>
              setLocal({
                ...local,
                departmentIds,
              })
            }
          />

          {/* PositionLookup */}
          <PositionLookup
            value={local.positionIds}
            onChange={(positionIds) =>
              setLocal({
                ...local,
                positionIds,
              })
            }
          />

          <div className='rounded-lg border p-4 space-y-4'>
            <h3 className='text-lg font-semibold'>{et('dateFilters')}</h3>

            {/* Hire Date */}
            <div className='space-y-2'>
              <Label>{et('hireDate')}</Label>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>
                    {et('from')}
                  </div>

                  <DatePicker
                    value={local.hireDateFrom}
                    onChange={(value) =>
                      setLocal({
                        ...local,
                        hireDateFrom: value,
                      })
                    }
                  />
                </div>

                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>
                    {et('to')}
                  </div>
                  <DatePicker
                    value={local.hireDateTo}
                    onChange={(value) =>
                      setLocal({
                        ...local,
                        hireDateTo: value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Contract End Date */}
            <div className='space-y-2'>
              <Label>{et('ced')}</Label>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>
                    {et('from')}
                  </div>

                  <DatePicker
                    value={local.contractEndDateFrom}
                    onChange={(value) =>
                      setLocal({
                        ...local,
                        contractEndDateFrom: value,
                      })
                    }
                  />
                </div>

                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>
                    {et('to')}
                  </div>

                  <DatePicker
                    value={local.contractEndDateTo}
                    onChange={(value) =>
                      setLocal({
                        ...local,
                        contractEndDateTo: value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CountryLookup */}
          {/* //TODO: Apply Nationality Lookup */}

          {/* Gender */}
          <div className='text-lg font-medium'>{et('gender')}</div>
          <EnterpriseFilterCheckboxGroup
            values={local.genders}
            options={[
              {
                value: 'male',
                label: et('male'),
              },
              {
                value: 'female',
                label: et('female'),
              },
            ]}
            onChange={(genders) =>
              setLocal({
                ...local,
                genders,
              })
            }
          />

          {/* Category */}
          <div className='text-lg font-medium'>{et('category')}</div>
          <EnterpriseFilterCheckboxGroup
            values={local.categoryCodes.map(String)}
            options={[
              { value: '1000', label: et('physician') },
              { value: '2000', label: et('nurse') },
              { value: '3000', label: et('allied') },
              { value: '4000', label: et('admin') },
              { value: '5000', label: et('support') },
            ]}
            onChange={(values) =>
              setLocal({
                ...local,
                categoryCodes: values.map(Number),
              })
            }
          />

          <div className='text-lg font-medium'>{et('status')}</div>
          <EnterpriseFilterCheckboxGroup
            values={local.employmentStatuses}
            options={[
              {
                value: 'active',
                label: et('active'),
              },
              // {
              //   value: 'leave',
              //   label: 'Leave',
              // },
              {
                value: 'terminated',
                label: et('terminated'),
              },
            ]}
            onChange={(employmentStatuses) =>
              setLocal({
                ...local,
                employmentStatuses,
              })
            }
          />
        </div>

        <div className='flex gap-3 m-4 '>
          <Button
            variant='outline'
            onClick={() => {
              const empty: EmployeeFilters = {
                departmentIds: [],
                positionIds: [],
                categoryCodes: [],
                genders: [],
                nationalities: [],
                employmentStatuses: [],
                hireDateFrom: undefined,
                hireDateTo: undefined,
                contractEndDateFrom: undefined,
                contractEndDateTo: undefined,
              }
              setLocal(empty)
              onReset()
            }}
          >
            {ct('reset')}
          </Button>

          <Button
            onClick={() => {
              //console.log(local)
              onApply(local)
              onOpenChange(false)
            }}
          >
            {ct('apply')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
