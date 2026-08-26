'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { usePositions } from '@/modules/hr/positions/hooks/use-positions'

export interface PositionLookupItem {
  id: string
  titleEn: string
  titleAr?: string | null
}

interface Props {
  value?: string | null
  selectedLabel?: string | null
  excludeIds?: string[]
  onChange: (position: PositionLookupItem) => void
}

export function PositionCombobox({
  value,
  onChange,
  selectedLabel,
  excludeIds = [],
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const locale = useLocale()
  const isRtl = locale === 'ar'
  const t = useTranslations('positions')
  const cnt = useTranslations('contracts')

  const { data, isLoading } = usePositions({
    page: 1,
    limit: 20,
    search,
  })

  const allItems: PositionLookupItem[] = data?.data ?? []

  const selected = allItems.find((item) => item.id === value)

  /*
   * Do not show positions that have already been selected
   * by a multi-select consumer.
   */
  const items = allItems.filter((position) => !excludeIds.includes(position.id))

  const displaySelectedLabel = selected
    ? isRtl
      ? (selected.titleAr ?? selected.titleEn)
      : selected.titleEn
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
            {displaySelectedLabel ?? cnt('selectPosition')}
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
            placeholder={t('searchPosition')}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {isLoading && <CommandItem disabled>Loading...</CommandItem>}

            {!isLoading && <CommandEmpty>No position found.</CommandEmpty>}

            <CommandGroup>
              {items.map((position) => {
                const label = isRtl
                  ? (position.titleAr ?? position.titleEn)
                  : position.titleEn

                const secondaryLabel = isRtl
                  ? position.titleEn
                  : position.titleAr

                return (
                  <CommandItem
                    key={position.id}
                    value={`${position.titleEn ?? ''} ${
                      position.titleAr ?? ''
                    }`}
                    onSelect={() => {
                      onChange(position)
                      setSearch('')
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={`me-2 h-4 w-4 ${
                        value === position.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    <div className='min-w-0 flex flex-col'>
                      <span className='truncate font-medium'>{label}</span>

                      {secondaryLabel && (
                        <span className='truncate text-xs text-muted-foreground'>
                          {secondaryLabel}
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
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'

// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from '@/components/ui/command'

// import { usePositions } from '@/modules/hr/positions/hooks/use-positions'

// interface PositionLookupItem {
//   id: string
//   titleEn: string
//   titleAr?: string | null
// }

// interface Props {
//   value?: string | null
//   selectedLabel?: string | null
//   onChange: (position: PositionLookupItem) => void
// }

// export function PositionCombobox({ value, onChange, selectedLabel }: Props) {
//   const [open, setOpen] = useState(false)
//   const [search, setSearch] = useState('')

//   const { data, isLoading } = usePositions({
//     page: 1,
//     limit: 20,
//     search,
//   })

//   //const items = data?.data ?? data?.items ?? []
//   const items = data?.data ?? []
//   const selected = items.find((item: PositionLookupItem) => item.id === value)

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           type='button'
//           variant='outline'
//           role='combobox'
//           className='w-full h-11 justify-between'
//         >
//           {selected ? selected.titleEn : (selectedLabel ?? 'Select position')}

//           <ChevronsUpDown className='ml-2 h-4 w-4 opacity-50' />
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className='w-[420px] p-0'>
//         <Command shouldFilter={false}>
//           <CommandInput
//             placeholder='Search position...'
//             value={search}
//             onValueChange={setSearch}
//           />

//           <CommandList>
//             {isLoading && <CommandItem disabled>Loading...</CommandItem>}

//             <CommandEmpty>No position found.</CommandEmpty>

//             <CommandGroup>
//               {items.map((position: PositionLookupItem) => (
//                 <CommandItem
//                   key={position.id}
//                   value={`${position.titleEn ?? ''} ${position.titleAr ?? ''}`}
//                   onSelect={() => {
//                     onChange(position)
//                     setOpen(false)
//                   }}
//                 >
//                   <Check
//                     className={`mr-2 h-4 w-4 ${
//                       value === position.id ? 'opacity-100' : 'opacity-0'
//                     }`}
//                   />

//                   <div className='flex flex-col'>
//                     <span className='font-medium'>{position.titleEn}</span>

//                     {position.titleAr && (
//                       <span className='text-xs text-muted-foreground'>
//                         {position.titleAr}
//                       </span>
//                     )}
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
