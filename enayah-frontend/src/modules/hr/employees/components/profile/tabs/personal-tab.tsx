'use client'

import { format } from 'date-fns'
import {
  CalendarDays,
  CircleAlert,
  Hash,
  IdCardLanyard,
  User,
  UserRound,
} from 'lucide-react'
import { gsap } from 'gsap'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale, useTranslations } from 'next-intl'
import { formatDate, toArabic } from '@/utils/utilities'
import {
  useEmployeePersonal,
  useEmployeePersonalMutations,
} from '../../../hooks/use-employee-personal-details'
import { PersonalDetailsCards } from './cards/personal-details'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import {
  Address,
  Dependent,
  Email,
  EmergencyContact,
  EmployeePersonalDetails,
  Identification,
  PhoneNumber,
  Visa,
} from '../../../types/employee-personal-details.types'
import { useDialogState } from '@/hooks/useDialogState'
import {
  AddressDialog,
  DependentDialog,
  EmailDialog,
  EmergencyContactDialog,
  IdentificationDialog,
  PhoneDialog,
  VisaDialog,
} from '@/components/dialogs/personal-detail-dialogs'
import { useState } from 'react'
import { useGsapBounceIn } from '@/hooks/use-gsap-bounce-in'

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

  nationality: EmployeeNationality | null
}

interface Props {
  personal: EmployeePersonal
}

interface FieldProps {
  label: string
  value?: React.ReactNode
  icon?: React.ReactNode
}

function Field({ label, value, icon }: FieldProps) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className='min-w-0 rounded-lg border bg-muted/10 p-4'>
      <div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground'>
        {icon}

        <span className='truncate'>{label}</span>
      </div>

      <div className='break-words text-sm font-medium text-foreground'>
        {hasValue ? value : '—'}
      </div>
    </div>
  )
}

//type IdentificationDeleteTarget = Pick<Identification, 'id' | 'type'>

type PersonalDetailDeleteTarget =
  | {
      kind: 'identification'
      id: string
      identificationType: Identification['type']
    }
  | {
      kind: 'phone'
      id: string
    }
  | {
      kind: 'email'
      id: string
    }
  | {
      kind: 'address'
      id: string
    }
  | {
      kind: 'dependent'
      id: string
    }
  | {
      kind: 'emergencyContact'
      id: string
    }
  | {
      kind: 'visa'
      id: string
    }

// function Field({ label, value, icon, isRtl = false }: FieldProps) {
//   const hasValue = value !== null && value !== undefined && value !== ''

//   return (
//     <div className='min-w-0 rounded-lg border bg-muted/10 p-4'>
//       <div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground'>
//         {icon}
//         <span>{label}</span>
//       </div>

//       <div
//         className={cn(
//           'break-words text-sm font-medium text-foreground',
//           isRtl && 'text-right',
//         )}
//       >
//         {hasValue ? value : '—'}
//       </div>
//     </div>
//   )
// }

const PersonalTab = ({ personal }: Props) => {
  const at = useTranslations('auth')
  const et = useTranslations('employees')
  const pt = useTranslations('employeePersonal')
  const ct = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [deleteTarget, setDeleteTarget] =
    useState<PersonalDetailDeleteTarget | null>(null)
  const {
    data: personalDetails,
    isLoading,
    error,
  } = useEmployeePersonal(personal.id)
  const identification =
    useDialogState<EmployeePersonalDetails['identifications'][number]>()
  const phone =
    useDialogState<EmployeePersonalDetails['phoneNumbers'][number]>()
  const email = useDialogState<EmployeePersonalDetails['emails'][number]>()
  const address = useDialogState<EmployeePersonalDetails['addresses'][number]>()
  const dependent =
    useDialogState<EmployeePersonalDetails['dependents'][number]>()
  const emergencyContact =
    useDialogState<EmployeePersonalDetails['emergencyContacts'][number]>()
  const visa = useDialogState<EmployeePersonalDetails['visas'][number]>()
  const employeePersonal = useEmployeePersonalMutations(personal.id)
  const dialogContentRef = useGsapBounceIn({
    enabled: deleteTarget !== null,
    // initialScale: 0.72,
    // overshootScale: 2.12,
    // settleScale: 0.95,
  })
  const fullNameEn = [
    personal.firstNameEn,
    personal.secondNameEn,
    personal.thirdNameEn,
    personal.familyNameEn,
  ]
    .filter(Boolean)
    .join(' ')

  const fullNameAr = [
    personal.firstNameAr,
    personal.secondNameAr,
    personal.thirdNameAr,
    personal.familyNameAr,
  ]
    .filter(Boolean)
    .join(' ')

  const nationality = isRtl
    ? (personal.nationality?.nationalityAr ??
      personal.nationality?.nationalityEn)
    : (personal.nationality?.nationalityEn ??
      personal.nationality?.nationalityAr)
  const getIdentificationLabel = (type: Identification['type']): string => {
    switch (type) {
      case 'national_id':
        return pt('types.nationalId')

      case 'iqama':
        return pt('types.iqama')

      case 'gcc_id':
        return pt('types.gccId')

      case 'passport':
        return pt('types.passport')

      case 'other':
        return pt('types.other')
    }
  }

  const getDeleteTargetLabel = (
    target: PersonalDetailDeleteTarget | null,
  ): string => {
    if (!target) {
      return ''
    }

    switch (target.kind) {
      case 'identification':
        return getIdentificationLabel(target.identificationType)

      case 'phone':
        return pt('entities.phone')

      case 'email':
        return pt('entities.email')

      case 'address':
        return pt('entities.address')

      case 'dependent':
        return pt('entities.dependent')

      case 'emergencyContact':
        return pt('entities.emergencyContact')

      case 'visa':
        return pt('entities.visa')
    }
  }

  const deleteTargetLabel = getDeleteTargetLabel(deleteTarget)

  // const deleteTypeLabel = deleteTarget ? getIdentificationLabel(deleteTarget.type) : ''

  const isDeletePending = (() => {
    if (!deleteTarget) {
      return false
    }

    switch (deleteTarget.kind) {
      case 'identification':
        return employeePersonal.deleteIdentification.isPending

      case 'phone':
        return employeePersonal.deletePhone.isPending

      case 'email':
        return employeePersonal.deleteEmail.isPending

      case 'address':
        return employeePersonal.deleteAddress.isPending

      case 'dependent':
        return employeePersonal.deleteDependent.isPending

      case 'emergencyContact':
        return employeePersonal.deleteEmergencyContact.isPending

      case 'visa':
        return employeePersonal.deleteVisa.isPending
    }
  })()

  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return
    }

    const onSuccess = () => {
      setDeleteTarget(null)
    }

    switch (deleteTarget.kind) {
      case 'identification':
        employeePersonal.deleteIdentification.mutate(
          {
            id: deleteTarget.id,
            type: deleteTarget.identificationType,
          },
          {
            onSuccess,
          },
        )
        break

      case 'phone':
        employeePersonal.deletePhone.mutate(deleteTarget.id, {
          onSuccess,
        })
        break

      case 'email':
        employeePersonal.deleteEmail.mutate(deleteTarget.id, {
          onSuccess,
        })
        break

      case 'address':
        employeePersonal.deleteAddress.mutate(deleteTarget.id, {
          onSuccess,
        })
        break

      case 'dependent':
        employeePersonal.deleteDependent.mutate(deleteTarget.id, {
          onSuccess,
        })
        break

      case 'emergencyContact':
        employeePersonal.deleteEmergencyContact.mutate(deleteTarget.id, {
          onSuccess,
        })
        break

      case 'visa':
        employeePersonal.deleteVisa.mutate(deleteTarget.id, {
          onSuccess,
        })
        break
    }
  }

  return (
    <div className='space-y-6'>
      {/* ---------------------------------- */}
      {/* Employee Identity */}
      {/* ---------------------------------- */}

      <Card className='overflow-hidden'>
        <CardHeader className='border-b bg-muted/20 px-5 py-4'>
          <div className='flex items-start gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg border sm:size-10 sm:rounded-xl bg-violet-500/10'>
              <IdCardLanyard
                aria-hidden='true'
                className='size-4 text-violet-600 sm:size-5 dark:text-violet-400'
              />
            </div>

            <div className='min-w-0'>
              <CardTitle className='text-sm text-violet-500 dark:text-violet-400 sm:text-base font-semibold tracking-tight'>
                {et('personalInfo')}
              </CardTitle>

              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {pt('personalInfoDescription')}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-5'>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
            <Field
              icon={<Hash className='size-3.5 shrink-0' />}
              label={at('employeeNumber')}
              value={
                <span className='font-mono tabular-nums' dir='ltr'>
                  {personal.employeeNumber}
                </span>
              }
            />

            <Field
              icon={<CalendarDays className='size-3.5 shrink-0' />}
              label={et('dateOfBirth').replace('*', '')}
              value={
                personal.dateOfBirth
                  ? formatDate(personal.dateOfBirth, isRtl)
                  : undefined
              }
            />

            <Field
              icon={<User className='size-3.5 shrink-0' />}
              label={et('gender')}
              value={et(personal.gender)}
            />

            <Field
              label={et('englishName')}
              value={
                <span dir='ltr' className='block text-left'>
                  {fullNameEn}
                </span>
              }
            />

            <Field
              label={et('arabicName')}
              value={
                <span dir='rtl' className='block text-right'>
                  {fullNameAr}
                </span>
              }
            />

            <Field label={et('nationality')} value={nationality} />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------- */}
      {/* Personal Detail Records */}
      {/* ---------------------------------- */}

      {isLoading ? (
        <Card className='overflow-hidden'>
          <CardHeader className='border-b bg-muted/20 px-5 py-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-10 rounded-lg' />

              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />

                <Skeleton className='h-3 w-64 max-w-full' />
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-5'>
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <Skeleton key={index} className='h-20 rounded-lg' />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <div className='rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4'>
          <div className='flex items-start gap-3'>
            <CircleAlert className='mt-0.5 size-5 shrink-0 text-destructive' />

            <div>
              <p className='text-sm font-medium text-destructive'>
                {pt('loadError')}
              </p>

              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {pt('loadErrorDescription')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <PersonalDetailsCards
            personalDetails={personalDetails}
            onAddIdentification={identification.add}
            onEditIdentification={(id) => {
              const item = personalDetails?.identifications.find(
                (item: Identification) => item.id === id,
              )

              if (!item) return

              identification.edit(item)
            }}
            onDeleteIdentification={(id) => {
              const item = personalDetails?.identifications.find(
                (identification: Identification) => identification.id === id,
              )

              if (!item) {
                return
              }

              setDeleteTarget({
                kind: 'identification',
                id: item.id,
                identificationType: item.type,
              })
            }}
            onAddPhone={phone.add}
            onEditPhone={(id) => {
              const item = personalDetails?.phoneNumbers.find(
                (item: PhoneNumber) => item.id === id,
              )

              if (!item) return

              phone.edit(item)
            }}
            onDeletePhone={(id) => {
              setDeleteTarget({
                kind: 'phone',
                id,
              })
            }}
            onAddEmail={email.add}
            onEditEmail={(id) => {
              const item = personalDetails?.emails.find(
                (item: Email) => item.id === id,
              )

              if (!item) return

              email.edit(item)
            }}
            onDeleteEmail={(id) => {
              setDeleteTarget({
                kind: 'email',
                id,
              })
            }}
            onAddAddress={address.add}
            onEditAddress={(id) => {
              const item = personalDetails?.addresses.find(
                (item: Address) => item.id === id,
              )

              if (!item) return

              address.edit(item)
            }}
            onDeleteAddress={(id) => {
              setDeleteTarget({
                kind: 'address',
                id,
              })
            }}
            onAddDependent={dependent.add}
            onEditDependent={(id) => {
              const item = personalDetails?.dependents.find(
                (item: Dependent) => item.id === id,
              )

              if (!item) return

              dependent.edit(item)
            }}
            onDeleteDependent={(id) => {
              setDeleteTarget({
                kind: 'dependent',
                id,
              })
            }}
            onAddEmergencyContact={emergencyContact.add}
            onEditEmergencyContact={(id) => {
              const item = personalDetails?.emergencyContacts.find(
                (item: EmergencyContact) => item.id === id,
              )

              if (!item) return

              emergencyContact.edit(item)
            }}
            onDeleteEmergencyContact={(id) => {
              setDeleteTarget({
                kind: 'emergencyContact',
                id,
              })
            }}
            onAddVisa={visa.add}
            onEditVisa={(id) => {
              const item = personalDetails?.visas.find(
                (item: Visa) => item.id === id,
              )

              if (!item) return

              visa.edit(item)
            }}
            onDeleteVisa={(id) => {
              setDeleteTarget({
                kind: 'visa',
                id,
              })
            }}
          />

          {/* <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open && !isDeletePending) {
                setDeleteTarget(null)
              }
            }}
          > */}
          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open && !isDeletePending) {
                setDeleteTarget(null)
              }
            }}
          >
            <AlertDialogContent className='bg-transparent p-0 ring-0 data-open:animate-none data-closed:animate-none'>
              <div
                ref={dialogContentRef}
                className='grid w-full gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10'
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {pt('deleteConfirmation.title', {
                      item: deleteTargetLabel,
                    })}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {pt('deleteConfirmation.description', {
                      item: deleteTargetLabel,
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletePending}>
                    {ct('cancel')}
                  </AlertDialogCancel>

                  <AlertDialogAction
                    className={buttonVariants({
                      variant: 'destructive',
                    })}
                    disabled={!deleteTarget || isDeletePending}
                    onClick={(event) => {
                      event.preventDefault()
                      confirmDelete()
                    }}
                  >
                    {isDeletePending
                      ? pt('deleteConfirmation.deleting')
                      : ct('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
          {/* </AlertDialog> */}

          <IdentificationDialog
            open={identification.open}
            onOpenChange={identification.setOpen}
            initialValue={identification.editing}
            onSubmit={(value) => {
              if (identification.editing) {
                employeePersonal.updateIdentification.mutate({
                  id: identification.editing.id,
                  data: value,
                  currentType: identification.editing.type,
                })
              } else {
                employeePersonal.createIdentification.mutate(value)
              }

              identification.close()
            }}
          />

          <PhoneDialog
            open={phone.open}
            onOpenChange={phone.setOpen}
            initialValue={phone.editing}
            onSubmit={(value) => {
              if (phone.editing) {
                employeePersonal.updatePhone.mutate({
                  id: phone.editing.id,
                  data: value,
                })
              } else {
                employeePersonal.createPhone.mutate(value)
              }

              phone.close()
            }}
          />

          <EmailDialog
            open={email.open}
            onOpenChange={email.setOpen}
            initialValue={email.editing}
            onSubmit={(value) => {
              if (email.editing) {
                employeePersonal.updateEmail.mutate({
                  id: email.editing.id,
                  data: value,
                })
              } else {
                employeePersonal.createEmail.mutate(value)
              }

              email.close()
            }}
          />

          <DependentDialog
            open={dependent.open}
            onOpenChange={dependent.setOpen}
            initialValue={dependent.editing}
            onSubmit={(value) => {
              if (dependent.editing) {
                employeePersonal.updateDependent.mutate({
                  id: dependent.editing.id,
                  data: value,
                })
              } else {
                employeePersonal.createDependent.mutate(value)
              }

              dependent.close()
            }}
          />

          <EmergencyContactDialog
            open={emergencyContact.open}
            onOpenChange={emergencyContact.setOpen}
            initialValue={emergencyContact.editing}
            onSubmit={(value) => {
              if (emergencyContact.editing) {
                employeePersonal.updateEmergencyContact.mutate({
                  id: emergencyContact.editing.id,
                  data: value,
                })
              } else {
                employeePersonal.createEmergencyContact.mutate(value)
              }

              emergencyContact.close()
            }}
          />

          <AddressDialog
            open={address.open}
            onOpenChange={address.setOpen}
            initialValue={address.editing}
            onSubmit={(value) => {
              if (address.editing) {
                employeePersonal.updateAddress.mutate({
                  id: address.editing.id,
                  data: value,
                })
              } else {
                employeePersonal.createAddress.mutate(value)
              }

              address.close()
            }}
          />

          <VisaDialog
            open={visa.open}
            onOpenChange={visa.setOpen}
            initialValue={visa.editing}
            onSubmit={(value) => {
              if (visa.editing) {
                employeePersonal.updateVisa.mutate({
                  id: visa.editing.id,

                  data: value,
                })
              } else {
                employeePersonal.createVisa.mutate(value)
              }

              visa.close()
            }}
          />
        </>
      )}
    </div>
  )
}

export default PersonalTab
