'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { employeeService } from '../services/employee.service'
import {
  CreateAddressDto,
  CreateDependentDto,
  CreateEmailDto,
  CreateEmergencyContactDto,
  CreateIdentificationDto,
  CreatePhoneDto,
  CreateVisaDto,
  UpdateAddressDto,
  UpdateDependentDto,
  UpdateEmailDto,
  UpdateEmergencyContactDto,
  UpdateIdentificationDto,
  UpdatePhoneDto,
  UpdateVisaDto,
} from '../types/employee-personal.dto'

export const employeePersonalKeys = {
  all: ['employee-personal-details'] as const,

  detail: (employeeId?: string) =>
    [...employeePersonalKeys.all, employeeId] as const,
}

type IdentificationType = CreateIdentificationDto['type']

type UpdateIdentificationVariables = {
  id: string
  data: UpdateIdentificationDto
  currentType: IdentificationType
}

type DeleteIdentificationVariables = {
  id: string
  type: IdentificationType
}

export function useEmployeePersonal(id?: string) {
  return useQuery({
    queryKey: employeePersonalKeys.detail(id),
    queryFn: () => employeeService.getPersonal(id!),
    enabled: Boolean(id),
  })
}

export function useEmployeePersonalMutations(employeeId: string) {
  const queryClient = useQueryClient()
  const it = useTranslations('employeePersonal')

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: employeePersonalKeys.detail(employeeId),
    })

  const getIdentificationLabel = (type: IdentificationType): string => {
    switch (type) {
      case 'national_id':
        return it('types.nationalId')

      case 'iqama':
        return it('types.iqama')

      case 'gcc_id':
        return it('types.gccId')

      case 'passport':
        return it('types.passport')

      case 'other':
        return it('types.other')
    }
  }

  return {
    // ------------------------------------------------------------------
    // Identifications
    // ------------------------------------------------------------------

    createIdentification: useMutation({
      mutationFn: (data: CreateIdentificationDto) =>
        employeeService.createIdentification(employeeId, data),

      onSuccess: async (_, variables) => {
        const typeLabel = getIdentificationLabel(variables.type)

        toast.success(
          it('notifications.createdTitle', {
            type: typeLabel,
          }),
          {
            description: it('notifications.createdDescription', {
              type: typeLabel,
            }),
            duration: 5000,
          },
        )

        await invalidate()
      },
    }),

    updateIdentification: useMutation({
      mutationFn: ({ id, data }: UpdateIdentificationVariables) =>
        employeeService.updateIdentification(employeeId, id, data),

      onSuccess: async (_, variables) => {
        /*
         * UpdateIdentificationDto is partial, so data.type may be absent.
         * Use the stored type supplied by the calling component as fallback.
         */
        const effectiveType = variables.data.type ?? variables.currentType

        const typeLabel = getIdentificationLabel(effectiveType)

        toast.success(
          it('notifications.updatedTitle', {
            type: typeLabel,
          }),
          {
            description: it('notifications.updatedDescription', {
              type: typeLabel,
            }),
            duration: 5000,
          },
        )

        await invalidate()
      },
    }),

    deleteIdentification: useMutation({
      mutationFn: ({ id }: DeleteIdentificationVariables) =>
        employeeService.deleteIdentification(employeeId, id),

      onSuccess: async (_, variables) => {
        const typeLabel = getIdentificationLabel(variables.type)

        toast.success(
          it('notifications.deletedTitle', {
            type: typeLabel,
          }),
          {
            description: it('notifications.deletedDescription', {
              type: typeLabel,
            }),
            duration: 5000,
          },
        )

        await invalidate()
      },
    }),

    // ------------------------------------------------------------------
    // Phones
    // ------------------------------------------------------------------

    createPhone: useMutation({
      mutationFn: (data: CreatePhoneDto) =>
        employeeService.createPhone(employeeId, data),

      onSuccess: invalidate,
    }),

    updatePhone: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdatePhoneDto }) =>
        employeeService.updatePhone(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deletePhone: useMutation({
      mutationFn: (id: string) => employeeService.deletePhone(employeeId, id),

      onSuccess: invalidate,
    }),

    // ------------------------------------------------------------------
    // Emails
    // ------------------------------------------------------------------

    createEmail: useMutation({
      mutationFn: (data: CreateEmailDto) =>
        employeeService.createEmail(employeeId, data),

      onSuccess: invalidate,
    }),

    updateEmail: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateEmailDto }) =>
        employeeService.updateEmail(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteEmail: useMutation({
      mutationFn: (id: string) => employeeService.deleteEmail(employeeId, id),

      onSuccess: invalidate,
    }),

    // ------------------------------------------------------------------
    // Addresses
    // ------------------------------------------------------------------

    createAddress: useMutation({
      mutationFn: (data: CreateAddressDto) =>
        employeeService.createAddress(employeeId, data),

      onSuccess: invalidate,
    }),

    updateAddress: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) =>
        employeeService.updateAddress(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteAddress: useMutation({
      mutationFn: (id: string) => employeeService.deleteAddress(employeeId, id),

      onSuccess: invalidate,
    }),

    // ------------------------------------------------------------------
    // Dependents
    // ------------------------------------------------------------------

    createDependent: useMutation({
      mutationFn: (data: CreateDependentDto) =>
        employeeService.createDependent(employeeId, data),

      onSuccess: invalidate,
    }),

    updateDependent: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateDependentDto }) =>
        employeeService.updateDependent(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteDependent: useMutation({
      mutationFn: (id: string) =>
        employeeService.deleteDependent(employeeId, id),

      onSuccess: invalidate,
    }),

    // ------------------------------------------------------------------
    // Emergency Contacts
    // ------------------------------------------------------------------

    createEmergencyContact: useMutation({
      mutationFn: (data: CreateEmergencyContactDto) =>
        employeeService.createEmergencyContact(employeeId, data),

      onSuccess: invalidate,
    }),

    updateEmergencyContact: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string
        data: UpdateEmergencyContactDto
      }) => employeeService.updateEmergencyContact(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteEmergencyContact: useMutation({
      mutationFn: (id: string) =>
        employeeService.deleteEmergencyContact(employeeId, id),

      onSuccess: invalidate,
    }),

    // ------------------------------------------------------------------
    // Visas
    // ------------------------------------------------------------------

    createVisa: useMutation({
      mutationFn: (data: CreateVisaDto) =>
        employeeService.createVisa(employeeId, data),

      onSuccess: invalidate,
    }),

    updateVisa: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateVisaDto }) =>
        employeeService.updateVisa(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteVisa: useMutation({
      mutationFn: (id: string) => employeeService.deleteVisa(employeeId, id),

      onSuccess: invalidate,
    }),
  }
}
