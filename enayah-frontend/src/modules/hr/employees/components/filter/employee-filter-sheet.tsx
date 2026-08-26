// enayah-frontend/src/modules/hr/employees/components/filter/employee-filter-sheet.tsx

'use client'

import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/dialogs/date-picker'

import { EnterpriseFilterCheckboxGroup } from '@/components/filter/enterprise-filter-checkbox-group'

import {
  DepartmentCombobox,
  type DepartmentLookupItem,
} from '@/modules/hr/departments/components/department-combobox'

import {
  PositionCombobox,
  type PositionLookupItem,
} from '@/modules/hr/positions/components/position-combobox'

import type { EmployeeFilters } from '../../types/employee-filter.types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: EmployeeFilters
  onApply: (filters: EmployeeFilters) => void
  onReset: () => void
}

interface FilterSectionProps {
  title: string
  count?: number
  children: ReactNode
}

function FilterSection({ title, count, children }: FilterSectionProps) {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <Label className='text-sm font-semibold'>{title}</Label>

        {!!count && (
          <span className='inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground'>
            {count}
          </span>
        )}
      </div>

      {children}
    </section>
  )
}

export function EmployeeFilterSheet({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
}: Props) {
  const [local, setLocal] = useState<EmployeeFilters>({
    ...values,
  })

  /*
   * Lookup objects are kept separately from EmployeeFilters.
   *
   * EmployeeFilters only needs IDs for the backend, while these objects
   * allow us to display the selected department/position labels.
   */
  const [selectedDepartments, setSelectedDepartments] = useState<
    DepartmentLookupItem[]
  >([])

  const [selectedPositions, setSelectedPositions] = useState<
    PositionLookupItem[]
  >([])

  const locale = useLocale()
  const isRtl = locale === 'ar'

  const et = useTranslations('employees')
  const ct = useTranslations('common')

  /*
   * Count each selected filter value.
   *
   * For example:
   * 2 departments
   * 1 position
   * 1 gender
   * 1 status
   *
   * = 5 active filters.
   */
  const activeFilterCount =
    local.departmentIds.length +
    local.positionIds.length +
    local.categoryCodes.length +
    local.genders.length +
    local.nationalities.length +
    local.employmentStatuses.length +
    [
      local.hireDateFrom,
      local.hireDateTo,
      local.contractEndDateFrom,
      local.contractEndDateTo,
    ].filter(Boolean).length

  /*
   * --------------------------------------------
   * Department
   * --------------------------------------------
   */

  function addDepartment(department: DepartmentLookupItem) {
    setLocal((current) => {
      if (current.departmentIds.includes(department.id)) {
        return current
      }

      return {
        ...current,
        departmentIds: [...current.departmentIds, department.id],
      }
    })

    setSelectedDepartments((current) => {
      if (current.some((item) => item.id === department.id)) {
        return current
      }

      return [...current, department]
    })
  }

  function removeDepartment(departmentId: string) {
    setLocal((current) => ({
      ...current,

      departmentIds: current.departmentIds.filter((id) => id !== departmentId),
    }))

    setSelectedDepartments((current) =>
      current.filter((department) => department.id !== departmentId),
    )
  }

  /*
   * --------------------------------------------
   * Position
   * --------------------------------------------
   */

  function addPosition(position: PositionLookupItem) {
    setLocal((current) => {
      if (current.positionIds.includes(position.id)) {
        return current
      }

      return {
        ...current,
        positionIds: [...current.positionIds, position.id],
      }
    })

    setSelectedPositions((current) => {
      if (current.some((item) => item.id === position.id)) {
        return current
      }

      return [...current, position]
    })
  }

  function removePosition(positionId: string) {
    setLocal((current) => ({
      ...current,

      positionIds: current.positionIds.filter((id) => id !== positionId),
    }))

    setSelectedPositions((current) =>
      current.filter((position) => position.id !== positionId),
    )
  }

  /*
   * --------------------------------------------
   * Reset
   * --------------------------------------------
   */

  function resetFilters() {
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

    setSelectedDepartments([])
    setSelectedPositions([])

    onReset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        /*
         * Every time the sheet opens, restore the currently
         * applied filter state from EmployeeWorkspace.
         */
        if (nextOpen) {
          setLocal(values)

          /*
           * Remove chip objects that are no longer part
           * of the applied filter state.
           */
          setSelectedDepartments((current) =>
            current.filter((department) =>
              values.departmentIds.includes(department.id),
            ),
          )

          setSelectedPositions((current) =>
            current.filter((position) =>
              values.positionIds.includes(position.id),
            ),
          )
        }

        onOpenChange(nextOpen)
      }}
    >
      <SheetContent
        side={isRtl ? 'left' : 'right'}
        dir={isRtl ? 'rtl' : 'ltr'}
        className='flex w-full flex-col gap-0 p-0 sm:max-w-[480px]'
      >
        {/* ================================================== */}
        {/* Header */}
        {/* ================================================== */}

        <SheetHeader className='shrink-0 border-b px-6 py-5'>
          <div className='flex items-start justify-between gap-4 pe-6'>
            <div className='min-w-0 space-y-1'>
              <SheetTitle className='text-lg font-semibold'>
                {et('filterEmployees')}
              </SheetTitle>

              <p className='text-sm leading-relaxed text-muted-foreground'>
                {et('filterEmployeesDescription')}
              </p>
            </div>

            {activeFilterCount > 0 && (
              <span
                className='inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary'
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* ================================================== */}
        {/* Scrollable Filters */}
        {/* ================================================== */}

        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='space-y-6 px-6 py-5'>
            {/* -------------------------------------------- */}
            {/* Department */}
            {/* -------------------------------------------- */}

            <FilterSection
              title={et('department')}
              count={local.departmentIds.length}
            >
              <DepartmentCombobox
                value={null}
                excludeIds={local.departmentIds}
                onChange={addDepartment}
              />

              {selectedDepartments.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                  {selectedDepartments.map((department) => {
                    const label = isRtl
                      ? (department.nameAr ?? department.nameEn)
                      : department.nameEn

                    return (
                      <div
                        key={department.id}
                        className='inline-flex max-w-full items-center rounded-md border bg-muted/40 text-xs transition-colors hover:bg-muted/60'
                      >
                        <span className='max-w-[320px] truncate py-1.5 ps-2.5 pe-1'>
                          {department.code && (
                            <span className='me-1.5 font-medium text-muted-foreground'>
                              {department.code}
                            </span>
                          )}

                          {label}
                        </span>

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='me-0.5 h-6 w-6 shrink-0 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          onClick={() => removeDepartment(department.id)}
                          aria-label={`Remove ${label}`}
                        >
                          <X className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </FilterSection>

            {/* -------------------------------------------- */}
            {/* Position */}
            {/* -------------------------------------------- */}

            <FilterSection
              title={et('position')}
              count={local.positionIds.length}
            >
              <PositionCombobox
                value={null}
                excludeIds={local.positionIds}
                onChange={addPosition}
              />

              {selectedPositions.length > 0 && (
                <div className='flex flex-wrap gap-1.5'>
                  {selectedPositions.map((position) => {
                    const label = isRtl
                      ? (position.titleAr ?? position.titleEn)
                      : position.titleEn

                    return (
                      <div
                        key={position.id}
                        className='inline-flex max-w-full items-center rounded-md border bg-muted/40 text-xs transition-colors hover:bg-muted/60'
                      >
                        <span className='max-w-[320px] truncate py-1.5 ps-2.5 pe-1'>
                          {label}
                        </span>

                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='me-0.5 h-6 w-6 shrink-0 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                          onClick={() => removePosition(position.id)}
                          aria-label={`Remove ${label}`}
                        >
                          <X className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </FilterSection>

            <Separator />

            {/* -------------------------------------------- */}
            {/* Date Filters */}
            {/* -------------------------------------------- */}

            <FilterSection title={et('dateFilters')}>
              <div className='space-y-5'>
                {/* Hire Date */}

                <div className='space-y-2.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>
                    {et('hireDate')}
                  </Label>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <span className='text-xs text-muted-foreground'>
                        {et('from')}
                      </span>

                      <DatePicker
                        value={local.hireDateFrom}
                        onChange={(value) =>
                          setLocal((current) => ({
                            ...current,
                            hireDateFrom: value,
                          }))
                        }
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <span className='text-xs text-muted-foreground'>
                        {et('to')}
                      </span>

                      <DatePicker
                        value={local.hireDateTo}
                        onChange={(value) =>
                          setLocal((current) => ({
                            ...current,
                            hireDateTo: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Contract End Date */}

                <div className='space-y-2.5'>
                  <Label className='text-xs font-medium text-muted-foreground'>
                    {et('ced')}
                  </Label>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <span className='text-xs text-muted-foreground'>
                        {et('from')}
                      </span>

                      <DatePicker
                        value={local.contractEndDateFrom}
                        onChange={(value) =>
                          setLocal((current) => ({
                            ...current,

                            contractEndDateFrom: value,
                          }))
                        }
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <span className='text-xs text-muted-foreground'>
                        {et('to')}
                      </span>

                      <DatePicker
                        value={local.contractEndDateTo}
                        onChange={(value) =>
                          setLocal((current) => ({
                            ...current,

                            contractEndDateTo: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* -------------------------------------------- */}
            {/* Nationality */}
            {/* -------------------------------------------- */}

            {/*
             * TODO:
             *
             * Add nationality combobox / multi-select here.
             *
             * local.nationalities already exists and is
             * included in activeFilterCount.
             */}

            {/* -------------------------------------------- */}
            {/* Gender */}
            {/* -------------------------------------------- */}

            <FilterSection title={et('gender')} count={local.genders.length}>
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
                  setLocal((current) => ({
                    ...current,
                    genders,
                  }))
                }
              />
            </FilterSection>

            {/* -------------------------------------------- */}
            {/* Category */}
            {/* -------------------------------------------- */}

            <FilterSection
              title={et('category')}
              count={local.categoryCodes.length}
            >
              <EnterpriseFilterCheckboxGroup
                values={local.categoryCodes.map(String)}
                options={[
                  {
                    value: '1000',
                    label: et('physician'),
                  },
                  {
                    value: '2000',
                    label: et('nurse'),
                  },
                  {
                    value: '3000',
                    label: et('allied_health'),
                  },
                  {
                    value: '4000',
                    label: et('administrative'),
                  },
                  {
                    value: '5000',
                    label: et('support_service'),
                  },
                ]}
                onChange={(values) =>
                  setLocal((current) => ({
                    ...current,

                    categoryCodes: values.map(Number),
                  }))
                }
              />
            </FilterSection>

            {/* -------------------------------------------- */}
            {/* Employment Status */}
            {/* -------------------------------------------- */}

            <FilterSection
              title={et('status')}
              count={local.employmentStatuses.length}
            >
              <EnterpriseFilterCheckboxGroup
                values={local.employmentStatuses}
                options={[
                  {
                    value: 'active',
                    label: et('employmentStatuses.active'),
                  },
                  {
                    value: 'on_leave',
                    label: et('employmentStatuses.onLeave'),
                  },
                  {
                    value: 'suspended',
                    label: et('employmentStatuses.suspended'),
                  },
                  {
                    value: 'ended',
                    label: et('employmentStatuses.ended'),
                  },
                ]}
                onChange={(employmentStatuses) =>
                  setLocal((current) => ({
                    ...current,
                    employmentStatuses,
                  }))
                }
              />
            </FilterSection>
          </div>
        </div>

        {/* ================================================== */}
        {/* Footer */}
        {/* ================================================== */}

        <div className='shrink-0 border-t bg-background px-6 py-4'>
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              className='flex-1'
              disabled={activeFilterCount === 0}
              onClick={resetFilters}
            >
              {ct('reset')}
            </Button>

            <Button
              type='button'
              className='flex-[1.5]'
              onClick={() => {
                onApply(local)
                onOpenChange(false)
              }}
            >
              {ct('apply')}

              {activeFilterCount > 0 && (
                <span className='ms-1.5 opacity-70'>({activeFilterCount})</span>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// 'use client'

// import { useState } from 'react'

// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from '@/components/ui/sheet'
// import { X } from 'lucide-react'

// import {
//   DepartmentCombobox,
//   type DepartmentLookupItem,
// } from '@/modules/hr/departments/components/department-combobox'

// import {
//   PositionCombobox,
//   type PositionLookupItem,
// } from '@/modules/hr/positions/components/position-combobox'

// import { Button } from '@/components/ui/button'

// //import { DepartmentLookup } from '@/modules/org/departments/components/department-lookup'
// // import { PositionLookup } from '@/modules/org/positions/components/position-lookup'
// // import { CountryLookup } from '@/modules/master/countries/components/country-lookup'

// import { EnterpriseFilterCheckboxGroup } from '@/components/filter/enterprise-filter-checkbox-group'
// import { DepartmentLookup } from '@/modules/hr/departments/components/department-lookup'
// import { PositionLookup } from '@/modules/hr/positions/components/position-lookup'
// import { Label } from '@/components/ui/label'
// import { DatePicker } from '@/components/dialogs/date-picker'
// import { useTranslations, useLocale } from 'next-intl'

// interface EmployeeFilters {
//   departmentIds: string[]
//   positionIds: string[]
//   categoryCodes: number[]
//   genders: string[]
//   nationalities: string[]
//   employmentStatuses: string[]

//   hireDateFrom?: string | null
//   hireDateTo?: string | null

//   contractEndDateFrom?: string | null
//   contractEndDateTo?: string | null
// }

// interface Props {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   values: EmployeeFilters
//   onApply: (filters: EmployeeFilters) => void
//   onReset: () => void
// }

// export function EmployeeFilterSheet({
//   open,
//   onOpenChange,
//   values,
//   onApply,
//   onReset,
// }: Props) {
//   const [local, setLocal] = useState<EmployeeFilters>({ ...values })
//   const et = useTranslations('employees')
//   const ct = useTranslations('common')

//   return (
//     <Sheet
//       open={open}
//       onOpenChange={(o) => {
//         if (o) {
//           setLocal(values)
//         }

//         onOpenChange(o)
//       }}
//     >
//       <SheetContent className=' w-[450px] overflow-y-auto'>
//         <SheetHeader>
//           <SheetTitle>{et('filterEmployees')}</SheetTitle>
//         </SheetHeader>

//         <div className='space-y-8 mt-6 mx-4'>
//           <DepartmentLookup
//             value={local.departmentIds}
//             onChange={(departmentIds) =>
//               setLocal({
//                 ...local,
//                 departmentIds,
//               })
//             }
//           />

//           {/* PositionLookup */}
//           <PositionLookup
//             value={local.positionIds}
//             onChange={(positionIds) =>
//               setLocal({
//                 ...local,
//                 positionIds,
//               })
//             }
//           />

//           <div className='rounded-lg border p-4 space-y-4'>
//             <h3 className='text-lg font-semibold'>{et('dateFilters')}</h3>

//             {/* Hire Date */}
//             <div className='space-y-2'>
//               <Label>{et('hireDate')}</Label>

//               <div className='grid grid-cols-2 gap-3'>
//                 <div className='space-y-1'>
//                   <div className='text-xs text-muted-foreground'>
//                     {et('from')}
//                   </div>

//                   <DatePicker
//                     value={local.hireDateFrom}
//                     onChange={(value) =>
//                       setLocal({
//                         ...local,
//                         hireDateFrom: value,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className='space-y-1'>
//                   <div className='text-xs text-muted-foreground'>
//                     {et('to')}
//                   </div>
//                   <DatePicker
//                     value={local.hireDateTo}
//                     onChange={(value) =>
//                       setLocal({
//                         ...local,
//                         hireDateTo: value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Contract End Date */}
//             <div className='space-y-2'>
//               <Label>{et('ced')}</Label>

//               <div className='grid grid-cols-2 gap-3'>
//                 <div className='space-y-1'>
//                   <div className='text-xs text-muted-foreground'>
//                     {et('from')}
//                   </div>

//                   <DatePicker
//                     value={local.contractEndDateFrom}
//                     onChange={(value) =>
//                       setLocal({
//                         ...local,
//                         contractEndDateFrom: value,
//                       })
//                     }
//                   />
//                 </div>

//                 <div className='space-y-1'>
//                   <div className='text-xs text-muted-foreground'>
//                     {et('to')}
//                   </div>

//                   <DatePicker
//                     value={local.contractEndDateTo}
//                     onChange={(value) =>
//                       setLocal({
//                         ...local,
//                         contractEndDateTo: value,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* CountryLookup */}
//           {/* //TODO: Apply Nationality Lookup */}

//           {/* Gender */}
//           <div className='text-lg font-medium'>{et('gender')}</div>
//           <EnterpriseFilterCheckboxGroup
//             values={local.genders}
//             options={[
//               {
//                 value: 'male',
//                 label: et('male'),
//               },
//               {
//                 value: 'female',
//                 label: et('female'),
//               },
//             ]}
//             onChange={(genders) =>
//               setLocal({
//                 ...local,
//                 genders,
//               })
//             }
//           />

//           {/* Category */}
//           <div className='text-lg font-medium'>{et('category')}</div>
//           <EnterpriseFilterCheckboxGroup
//             values={local.categoryCodes.map(String)}
//             options={[
//               { value: '1000', label: et('physician') },
//               { value: '2000', label: et('nurse') },
//               { value: '3000', label: et('allied_health') },
//               { value: '4000', label: et('administrative') },
//               { value: '5000', label: et('support_service') },
//             ]}
//             onChange={(values) =>
//               setLocal({
//                 ...local,
//                 categoryCodes: values.map(Number),
//               })
//             }
//           />

//           <div className='text-lg font-medium'>{et('status')}</div>
//           <EnterpriseFilterCheckboxGroup
//             values={local.employmentStatuses}
//             options={[
//               {
//                 value: 'active',
//                 label: et('employmentStatuses.active'),
//               },
//               {
//                 value: 'on_leave',
//                 label: et('employmentStatuses.onLeave'),
//               },
//               {
//                 value: 'suspended',
//                 label: et('employmentStatuses.suspended'),
//               },
//               {
//                 value: 'ended',
//                 label: et('employmentStatuses.ended'),
//               },
//               // {
//               //   value: 'terminated',
//               //   label: et('terminated'),
//               // },
//             ]}
//             onChange={(employmentStatuses) =>
//               setLocal({
//                 ...local,
//                 employmentStatuses,
//               })
//             }
//           />
//         </div>

//         <div className='flex gap-3 m-4 '>
//           <Button
//             variant='outline'
//             onClick={() => {
//               const empty: EmployeeFilters = {
//                 departmentIds: [],
//                 positionIds: [],
//                 categoryCodes: [],
//                 genders: [],
//                 nationalities: [],
//                 employmentStatuses: [],
//                 hireDateFrom: undefined,
//                 hireDateTo: undefined,
//                 contractEndDateFrom: undefined,
//                 contractEndDateTo: undefined,
//               }
//               setLocal(empty)
//               onReset()
//             }}
//           >
//             {ct('reset')}
//           </Button>

//           <Button
//             onClick={() => {
//               //console.log(local)
//               onApply(local)
//               onOpenChange(false)
//             }}
//           >
//             {ct('apply')}
//           </Button>
//         </div>
//       </SheetContent>
//     </Sheet>
//   )
// }
