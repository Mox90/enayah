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
          <SheetTitle>Employee Filters</SheetTitle>
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
            <h3 className='text-lg font-semibold'>Date Filters</h3>

            {/* Hire Date */}

            <div className='space-y-2'>
              <Label>Hire Date</Label>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>From</div>

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
                  <div className='text-xs text-muted-foreground'>To</div>
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
              <Label>Contract End Date</Label>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1'>
                  <div className='text-xs text-muted-foreground'>From</div>

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
                  <div className='text-xs text-muted-foreground'>To</div>

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

          <div className='text-lg font-medium'>Gender</div>
          <EnterpriseFilterCheckboxGroup
            values={local.genders}
            options={[
              {
                value: 'male',
                label: 'Male',
              },
              {
                value: 'female',
                label: 'Female',
              },
            ]}
            onChange={(genders) =>
              setLocal({
                ...local,
                genders,
              })
            }
          />

          <div className='text-lg font-medium'>Category</div>

          <EnterpriseFilterCheckboxGroup
            values={local.categoryCodes.map(String)}
            options={[
              { value: '1000', label: 'Physician' },
              { value: '2000', label: 'Nurse' },
              { value: '3000', label: 'Allied Health' },
              { value: '4000', label: 'Administrative' },
              { value: '5000', label: 'Support Services' },
            ]}
            onChange={(values) =>
              setLocal({
                ...local,

                categoryCodes: values.map(Number),
              })
            }
          />

          <div className='text-lg font-medium'>Status</div>
          <EnterpriseFilterCheckboxGroup
            values={local.employmentStatuses}
            options={[
              {
                value: 'active',
                label: 'Active',
              },
              {
                value: 'leave',
                label: 'Leave',
              },
              {
                value: 'terminated',
                label: 'Terminated',
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
            Reset
          </Button>

          <Button
            onClick={() => {
              //console.log(local)
              onApply(local)
              onOpenChange(false)
            }}
          >
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
