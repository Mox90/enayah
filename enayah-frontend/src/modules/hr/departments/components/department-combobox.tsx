'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { useDepartments } from '@/modules/hr/departments/hooks/use-departments'

export interface DepartmentLookupItem {
  id: string
  code?: string | null
  nameEn: string
  nameAr?: string | null
}

interface Props {
  value?: string | null
  selectedLabel?: string | null
  excludeIds?: string[]
  onChange: (department: DepartmentLookupItem) => void
}

export function DepartmentCombobox({
  value,
  onChange,
  selectedLabel,
  excludeIds = [],
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const locale = useLocale()
  const isRtl = locale === 'ar'
  const t = useTranslations('departments')
  const cnt = useTranslations('contracts')

  const { data, isLoading } = useDepartments({
    page: 1,
    limit: 20,
    search,
  })

  const allItems: DepartmentLookupItem[] = data?.data ?? []

  /*
   * Keep the selected item lookup against the unfiltered list.
   *
   * This preserves the existing single-select behaviour used by
   * onboarding even when excludeIds is supplied somewhere else.
   */
  const selected = allItems.find((item) => item.id === value)

  /*
   * Items already selected by a multi-select consumer, such as the
   * employee filter sheet, are removed from the dropdown.
   */
  const items = allItems.filter(
    (department) => !excludeIds.includes(department.id),
  )

  const displaySelectedLabel = selected
    ? isRtl
      ? (selected.nameAr ?? selected.nameEn)
      : selected.nameEn
    : selectedLabel

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          setSearch('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='h-11 w-full justify-between'
        >
          <span className='truncate'>
            {displaySelectedLabel ?? cnt('selectDepartment')}
          </span>

          <ChevronsUpDown className='ms-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='w-[var(--radix-popover-trigger-width)] p-0'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('searchDepartment')}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isLoading && <CommandItem disabled>Loading...</CommandItem>}

            {!isLoading && <CommandEmpty>No department found.</CommandEmpty>}

            <CommandGroup>
              {items.map((department) => {
                const label = isRtl
                  ? (department.nameAr ?? department.nameEn)
                  : department.nameEn

                return (
                  <CommandItem
                    key={department.id}
                    value={`${department.code ?? ''} ${
                      department.nameEn ?? ''
                    } ${department.nameAr ?? ''}`}
                    onSelect={() => {
                      onChange(department)
                      setSearch('')
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`me-2 h-4 w-4 ${
                        value === department.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    <div className='min-w-0 flex flex-col'>
                      <span className='truncate font-medium'>{label}</span>

                      {(department.code ||
                        (isRtl ? department.nameEn : department.nameAr)) && (
                        <span className='truncate text-xs text-muted-foreground'>
                          {department.code}

                          {department.code &&
                          (isRtl ? department.nameEn : department.nameAr)
                            ? ' · '
                            : ''}

                          {isRtl ? department.nameEn : department.nameAr}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// 'use client'

// import { useState } from 'react'
// import { Check, ChevronsUpDown } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from '@/components/ui/command'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'

// import { useDepartments } from '@/modules/hr/departments/hooks/use-departments'

// interface DepartmentLookupItem {
//   id: string
//   code?: string | null
//   nameEn: string
//   nameAr?: string | null
// }

// interface Props {
//   value?: string | null
//   selectedLabel?: string | null
//   onChange: (department: DepartmentLookupItem) => void
// }

// export function DepartmentCombobox({ value, onChange, selectedLabel }: Props) {
//   const [open, setOpen] = useState(false)
//   const [search, setSearch] = useState('')

//   const { data, isLoading } = useDepartments({
//     page: 1,
//     limit: 20,
//     search,
//   })

//   //const items = data?.data ?? data?.items ?? []
//   const items = data?.data ?? []
//   const selected = items.find((item: DepartmentLookupItem) => item.id === value)

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           type='button'
//           variant='outline'
//           role='combobox'
//           className='w-full h-11 justify-between'
//         >
//           {selected ? selected.nameEn : (selectedLabel ?? 'Select department')}

//           <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className='w-105 p-0'>
//         <Command shouldFilter={false}>
//           <CommandInput
//             placeholder='Search department...'
//             value={search}
//             onValueChange={setSearch}
//           />

//           <CommandList>
//             {isLoading && <CommandItem disabled>Loading...</CommandItem>}

//             <CommandEmpty>No department found.</CommandEmpty>

//             <CommandGroup>
//               {items.map((department: DepartmentLookupItem) => (
//                 <CommandItem
//                   key={department.id}
//                   value={`${department.code ?? ''} ${department.nameEn ?? ''} ${
//                     department.nameAr ?? ''
//                   }`}
//                   onSelect={() => {
//                     onChange(department)
//                     setOpen(false)
//                   }}
//                 >
//                   <Check
//                     className={`mr-2 h-4 w-4 ${
//                       value === department.id ? 'opacity-100' : 'opacity-0'
//                     }`}
//                   />

//                   <div className='flex flex-col'>
//                     <span className='font-medium'>{department.nameEn}</span>

//                     <span className='text-xs text-muted-foreground'>
//                       {department.code}
//                       {department.nameAr ? ` · ${department.nameAr}` : ''}
//                     </span>
//                   </div>
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }
