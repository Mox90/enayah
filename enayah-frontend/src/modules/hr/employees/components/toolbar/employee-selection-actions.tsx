// 'use client'

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'

// import { Button } from '@/components/ui/button'

// import {
//   Download,
//   Printer,
//   MoreHorizontal,
//   FileSpreadsheet,
//   FileText,
//   File,
//   Mail,
//   UserRoundCog,
//   UserMinus,
//   UserX,
//   Eye,
//   FilePenLine,
// } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import { useLocale, useTranslations } from 'next-intl'

// interface Props {
//   selectedIds: string[]
// }

// export function EmployeeSelectionActions({ selectedIds }: Props) {
//   const router = useRouter()
//   const locale = useLocale()
//   const t = useTranslations('common')
//   if (selectedIds.length === 0) {
//     return null
//   }

//   const singleSelected = selectedIds.length === 1

//   return (
//     <div className='flex items-center gap-3'>
//       <span className='text-sm font-medium'>
//         {selectedIds.length} {t('selected')}
//       </span>

//       {/* --------------------- */}
//       {/* Export */}
//       {/* --------------------- */}

//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant='outline'>
//             <Download className='mr-2 h-4 w-4' />
//             {t('export')}
//           </Button>
//         </DropdownMenuTrigger>

//         <DropdownMenuContent align='start'>
//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Export Excel', selectedIds)
//             }}
//           >
//             <FileSpreadsheet className='mr-2 h-4 w-4' />
//             {t('excel')}
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Export CSV', selectedIds)
//             }}
//           >
//             <File className='mr-2 h-4 w-4' />
//             {t('csv')}
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Export PDF', selectedIds)
//             }}
//           >
//             <FileText className='mr-2 h-4 w-4' />
//             {t('pdf')}
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       {/* --------------------- */}
//       {/* Print */}
//       {/* --------------------- */}

//       <Button
//         variant='outline'
//         onClick={() => {
//           console.log('Print', selectedIds)
//         }}
//       >
//         <Printer className='mr-2 h-4 w-4' />
//         {t('print')}
//       </Button>

//       {/* --------------------- */}
//       {/* Bulk Actions */}
//       {/* --------------------- */}

//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant='outline'>
//             <MoreHorizontal className='mr-2 h-4 w-4' />
//             {t('actions')}
//           </Button>
//         </DropdownMenuTrigger>

//         <DropdownMenuContent align='end'>
//           {singleSelected && (
//             <>
//               <DropdownMenuItem
//                 onClick={() =>
//                   router.push(`/${locale}/employees/${selectedIds[0]}/profile`)
//                 }
//               >
//                 <Eye className='mr-2 h-4 w-4' />
//                 {t('profile')}
//               </DropdownMenuItem>

//               <DropdownMenuItem
//                 onClick={() =>
//                   router.push(
//                     `/${locale}/contracts/new?employeeId=${selectedIds[0]}`,
//                   )
//                 }
//               >
//                 <FilePenLine className='mr-2 h-4 w-4' />
//                 {t('amendContract')}
//               </DropdownMenuItem>
//             </>
//           )}

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Assign Training', selectedIds)
//             }}
//           >
//             <UserRoundCog className='mr-2 h-4 w-4' />
//             {t('assignTraining')}
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Send Email', selectedIds)
//             }}
//           >
//             <Mail className='mr-2 h-4 w-4' />
//             {t('sendEmail')}
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Deactivate', selectedIds)
//             }}
//           >
//             <UserMinus className='mr-2 h-4 w-4' />
//             {t('deactivate')}
//           </DropdownMenuItem>

//           <DropdownMenuItem
//             onClick={() => {
//               console.log('Terminate', selectedIds)
//             }}
//           >
//             <UserX className='mr-2 h-4 w-4' />
//             {t('terminate')}
//           </DropdownMenuItem>

//           {/* <DropdownMenuItem
//             onClick={() => {
//               console.log('Amend Contract', selectedIds)
//             }}
//           >
//             <UserX className='mr-2 h-4 w-4' />
//             Amend Contract
//           </DropdownMenuItem> */}
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   )
// }

'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import {
  Download,
  Printer,
  MoreHorizontal,
  FileSpreadsheet,
  FileText,
  File,
  Mail,
  UserRoundCog,
  UserMinus,
  UserX,
  Eye,
  FilePenLine,
  ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  selectedIds: string[]
}

export function EmployeeSelectionActions({ selectedIds }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('common')

  if (selectedIds.length === 0) return null

  const singleSelected = selectedIds.length === 1

  return (
    <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center'>
      <div className='flex h-10 items-center rounded-xl border bg-muted/40 px-3 text-sm font-medium'>
        {selectedIds.length} {t('selected')}
      </div>

      <div className='grid grid-cols-2 gap-2 sm:flex sm:items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='h-10 rounded-xl'>
              <Download className='mr-2 h-4 w-4' />
              {t('export')}
              <ChevronDown className='ml-2 h-4 w-4 opacity-60' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='start' className='w-44'>
            <DropdownMenuItem
              onClick={() => console.log('Export Excel', selectedIds)}
            >
              <FileSpreadsheet className='mr-2 h-4 w-4' />
              {t('excel')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log('Export CSV', selectedIds)}
            >
              <File className='mr-2 h-4 w-4' />
              {t('csv')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log('Export PDF', selectedIds)}
            >
              <FileText className='mr-2 h-4 w-4' />
              {t('pdf')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant='outline'
          className='h-10 rounded-xl'
          onClick={() => console.log('Print', selectedIds)}
        >
          <Printer className='mr-2 h-4 w-4' />
          {t('print')}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='col-span-2 h-10 rounded-xl sm:col-span-1'
            >
              <MoreHorizontal className='mr-2 h-4 w-4' />
              {t('actions')}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-56'>
            {singleSelected && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/${locale}/employees/${selectedIds[0]}/profile`,
                    )
                  }
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {t('profile')}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/${locale}/contracts/new?employeeId=${selectedIds[0]}`,
                    )
                  }
                >
                  <FilePenLine className='mr-2 h-4 w-4' />
                  {t('amendContract')}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => console.log('Assign Training', selectedIds)}
            >
              <UserRoundCog className='mr-2 h-4 w-4' />
              {t('assignTraining')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log('Send Email', selectedIds)}
            >
              <Mail className='mr-2 h-4 w-4' />
              {t('sendEmail')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => console.log('Deactivate', selectedIds)}
            >
              <UserMinus className='mr-2 h-4 w-4' />
              {t('deactivate')}
            </DropdownMenuItem>

            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => console.log('Terminate', selectedIds)}
            >
              <UserX className='mr-2 h-4 w-4' />
              {t('terminate')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
