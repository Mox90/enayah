'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { VerificationBadge } from '@/components/badges/verification-badge'
import { DegreeInput } from '@/modules/hr/onboarding/types/onboarding.types'
import { Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toArabic, toPersianDigits } from '@/utils/utilities'
import { cn } from '@/lib/utils'
import { RowActions } from '@/components/dialogs/row-actions'

// interface Degree {
//   id: string
//   degreeType: string
//   degreeName: string
//   major?: string | null
//   institution: string
//   graduationDate: string | null
//   isVerified?: boolean
// }

interface Props {
  degrees: DegreeInput[] //Degree[]
  onAdd?: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const degreeTypeLabel: Record<string, string> = {
  diploma: 'Diploma',
  associate: 'Associate',
  bachelor: 'Bachelor',
  master: 'Master',
  doctorate: 'Doctorate',
  other: 'Other',
}

const degreeTypeColors: Record<string, string> = {
  doctorate: 'bg-purple-100 text-purple-800 border-purple-200',
  master: 'bg-blue-100 text-blue-800 border-blue-200',
  bachelor: 'bg-green-100 text-green-800 border-green-200',
  diploma: 'bg-amber-100 text-amber-800 border-amber-200',
  associate: 'bg-orange-100 text-orange-800 border-orange-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

// const statusClass: Record<string, string> = {
//   active: 'bg-green-100 text-green-700 border-green-200',
//   on_leave: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//   transferred: 'bg-blue-100 text-blue-700 border-blue-200',
//   resigned: 'bg-orange-100 text-orange-700 border-orange-200',
//   eoc: 'bg-purple-100 text-purple-700 border-purple-200',
//   terminated: 'bg-red-100 text-red-700 border-red-200',
// }

export function CredentialDegrees({ degrees, onAdd, onEdit, onDelete }: Props) {
  //console.log(degrees)
  const ct = useTranslations('credentials')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>
          🎓 {ct('highestEducationalLabel')} (
          {isRtl ? toPersianDigits(degrees.length) : degrees.length})
        </CardTitle>

        <Button size='sm' onClick={onAdd}>
          {/* <Plus className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4`} /> */}
          <Plus className={cn('h-4 w-4', isRtl ? 'ml-2' : 'mr-4')} />
          {ct('addDegree')}
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        {degrees.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            {ct.rich('noRecFound', { item: isRtl ? 'تعليم' : 'Education' })}
          </div>
        )}
        <div className='text-sm text-muted-foreground'>
          {ct('highestEducationalSub')}
        </div>
        {degrees.map((degree, index) => (
          <div
            key={degree.id ?? `${degree.degreeName}-${index}`}
            className='rounded-lg border p-4'
          >
            <div className='flex justify-between'>
              <div className='space-y-1'>
                <div className='font-semibold'>{degree.degreeName}</div>

                <div className='text-sm text-muted-foreground'>
                  {degree.institution}
                </div>

                {degree.major && (
                  <div className='text-sm'>
                    {ct('major')}: {degree.major}
                  </div>
                )}

                {degree.graduationDate && (
                  <div className='text-sm'>
                    {ct('graduated')}:{' '}
                    {isRtl
                      ? toArabic(degree.graduationDate, 1)
                      : format(new Date(degree.graduationDate), 'dd-MMM-yyyy')}
                  </div>
                )}

                <div className='text-sm'>
                  {ct('type')}: {ct(degree.degreeType)}
                </div>

                <VerificationBadge verified={degree.isVerified ?? false} />
              </div>

              {/* <div className='flex flex-col items-end gap-2'>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size='icon' variant='ghost'>
                      <MoreVertical className='h-4 w-4 text-green-700' />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {onEdit && (
                      <DropdownMenuItem
                        className={
                          isRtl
                            ? 'justify-end text-right'
                            : 'justify-start text-left'
                        }
                        onClick={() => {
                          if (!degree.id) return
                          onEdit(degree.id)
                        }}
                      >
                        {ct('edit')}
                      </DropdownMenuItem>
                    )}

                    {onDelete && (
                      <DropdownMenuItem
                        className={`text-red-600 ${
                          isRtl
                            ? 'justify-end text-right'
                            : 'justify-start text-left'
                        }`}
                        onClick={() => {
                          if (!degree.id) return
                          onDelete(degree.id)
                        }}
                      >
                        {ct('delete')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
              <RowActions
                onEdit={() => onEdit?.(degree.id!)}
                onDelete={() => onDelete?.(degree.id!)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
