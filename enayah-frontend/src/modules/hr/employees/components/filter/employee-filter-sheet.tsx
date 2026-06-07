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

interface EmployeeFilters {
  departmentIds: string[]
  positionIds: string[]
  categoryCodes: number[]
  genders: string[]
  nationalities: string[]
  employmentStatuses: string[]
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
  const [local, setLocal] = useState(values)

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
      <SheetContent className='w-[450px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Employee Filters</SheetTitle>
        </SheetHeader>

        <div className='space-y-8 mt-6'>
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

          {/* CountryLookup */}

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

        <div className='flex gap-3 mt-8'>
          <Button variant='outline' onClick={onReset}>
            Reset
          </Button>

          <Button
            onClick={() => {
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
