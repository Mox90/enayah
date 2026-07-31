'use client'

import { format } from 'date-fns'
import { Calendar, Hash, User } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale, useTranslations } from 'next-intl'
import { toArabic, toPersianDigits } from '@/utils/utilities'
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
  value: React.ReactNode
  icon?: React.ReactNode
  isRtl?: boolean
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

function Field({ label, value, icon, isRtl = false }: FieldProps) {
  return (
    <div className='rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30'>
      <div className='mb-2 flex items-center gap-2 text-xs text-muted-foreground'>
        {icon}
        {label}
      </div>

      <div className={cn('font-medium text-foreground', isRtl && 'text-right')}>
        {value ?? '-'}
      </div>
    </div>
  )
}

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
      {/* ---------------------------- */}
      {/* Personal Information */}
      {/* ---------------------------- */}

      <Card className='transition-all duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-rose-400'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl '>
              {/* <IdCardLanyard className='h-5 w-5' /> */}
              <span className='text-3xl'>🪪</span>
            </div>
            {et('personalInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
            <Field
              icon={<Hash className='h-3.5 w-3.5' />}
              label={at('employeeNumber')}
              value={personal.employeeNumber}
            />

            <Field
              icon={<Calendar className='h-3.5 w-3.5' />}
              label={et('dateOfBirth').replace('*', '')}
              value={
                personal.dateOfBirth
                  ? isRtl
                    ? toArabic(personal.dateOfBirth, 1)
                    : format(new Date(personal.dateOfBirth), 'dd-MMM-yyyy')
                  : '-'
              }
            />

            <Field
              icon={<User className='h-3.5 w-3.5' />}
              label={et('gender')}
              value={et(personal.gender)}
            />

            <Field
              label={et('englishName')}
              value={[
                personal.firstNameEn,
                personal.secondNameEn,
                personal.thirdNameEn,
                personal.familyNameEn,
              ]
                .filter(Boolean)
                .join(' ')}
            />

            <Field
              label={et('arabicName')}
              value={[
                personal.firstNameAr,
                personal.secondNameAr,
                personal.thirdNameAr,
                personal.familyNameAr,
              ]
                .filter(Boolean)
                .join(' ')}
              isRtl
            />

            <Field
              label={et('nationality')}
              value={
                isRtl
                  ? (personal.nationality?.nationalityAr ??
                    personal.nationality?.nationalityEn)
                  : personal.nationality?.nationalityEn
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------- */}
      {/* Country */}
      {/* ---------------------------- */}

      <Card className='transition-all duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-blue-600'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl'>
              {/* <Earth className='h-5 w-5' /> */}
              <span className='text-3xl'>🌏</span>
            </div>
            {et('countryInfo')}
          </CardTitle>

          {/* <Button size='sm' variant='outline'>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </Button> */}
        </CardHeader>

        <CardContent>
          <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>
            <Field
              label={et('country')}
              value={
                isRtl
                  ? (personal.nationality?.nameAr ?? personal.nationality?.name)
                  : personal.nationality?.name
              }
            />

            <Field
              label={et('nationality')}
              value={
                isRtl
                  ? (personal.nationality?.nationalityAr ??
                    personal.nationality?.nationalityEn)
                  : personal.nationality?.nationalityEn
              }
            />

            <Field label={et('alpha2')} value={personal.nationality?.alpha2} />

            <Field label={et('alpha3')} value={personal.nationality?.alpha3} />

            <Field
              label={et('numericCode')}
              value={
                isRtl
                  ? toPersianDigits(personal.nationality?.numericCode)
                  : personal.nationality?.numericCode
              }
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className='text-sm text-muted-foreground'>
          <Card className='transition-all duration-200 hover:shadow-md'>
            <CardHeader>
              <Skeleton className='h-6 w-56' />
            </CardHeader>

            <CardContent className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-20 rounded-xl' />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className='text-sm text-destructive'>
          Failed to load personal details. Please try again.
        </div>
      ) : (
        // <PersonalDetailsCards personalDetails={personalDetails} />
        <>
          <PersonalDetailsCards
            personalDetails={personalDetails}
            onAddIdentification={identification.add}
            onEditIdentification={(id) => {
              const item = personalDetails?.identifications.find(
                (x: Identification) => x.id === id,
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
                (x: PhoneNumber) => x.id === id,
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
                (x: Email) => x.id === id,
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
                (x: Address) => x.id === id,
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
                (x: Dependent) => x.id === id,
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
                (x: EmergencyContact) => x.id === id,
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
              const item = personalDetails?.visas.find((x: Visa) => x.id === id)
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

          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open && !isDeletePending) {
                setDeleteTarget(null)
              }
            }}
          >
            <AlertDialogContent>
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
            </AlertDialogContent>
          </AlertDialog>

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
