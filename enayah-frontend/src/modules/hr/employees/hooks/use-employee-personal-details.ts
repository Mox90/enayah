import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

//const employeePersonalKey = (id?: string) => ['employee-personal', id]
export const employeePersonalKeys = {
  all: ['employee-personal-details'] as const,

  detail: (employeeId?: string) =>
    [...employeePersonalKeys.all, employeeId] as const,
}

export function useEmployeePersonal(id?: string) {
  return useQuery({
    queryKey: employeePersonalKeys.detail(id), //['employee-personal', id],
    queryFn: () => employeeService.getPersonal(id!),
    enabled: !!id,
  })
}

export function useEmployeePersonalMutations(employeeId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: employeePersonalKeys.detail(employeeId), //employeePersonalKey(employeeId),
    })
  }

  return {
    // Identifications

    createIdentification: useMutation({
      mutationFn: (data: CreateIdentificationDto) =>
        employeeService.createIdentification(employeeId, data),

      onSuccess: invalidate,
    }),

    updateIdentification: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string
        data: UpdateIdentificationDto
      }) => employeeService.updateIdentification(employeeId, id, data),

      onSuccess: invalidate,
    }),

    deleteIdentification: useMutation({
      mutationFn: (id: string) => employeeService.deleteIdentification(id),

      onSuccess: invalidate,
    }),

    // Phones

    createPhone: useMutation({
      mutationFn: (data: CreatePhoneDto) =>
        employeeService.createPhone(employeeId, data),

      onSuccess: invalidate,
    }),

    updatePhone: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdatePhoneDto }) =>
        employeeService.updatePhone(id, data),

      onSuccess: invalidate,
    }),

    deletePhone: useMutation({
      mutationFn: (id: string) => employeeService.deletePhone(id),

      onSuccess: invalidate,
    }),

    // Emails

    createEmail: useMutation({
      mutationFn: (data: CreateEmailDto) =>
        employeeService.createEmail(employeeId, data),

      onSuccess: invalidate,
    }),

    updateEmail: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateEmailDto }) =>
        employeeService.updateEmail(id, data),

      onSuccess: invalidate,
    }),

    deleteEmail: useMutation({
      mutationFn: (id: string) => employeeService.deleteEmail(id),

      onSuccess: invalidate,
    }),

    // Addresses

    createAddress: useMutation({
      mutationFn: (data: CreateAddressDto) =>
        employeeService.createAddress(employeeId, data),

      onSuccess: invalidate,
    }),

    updateAddress: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) =>
        employeeService.updateAddress(id, data),

      onSuccess: invalidate,
    }),

    deleteAddress: useMutation({
      mutationFn: (id: string) => employeeService.deleteAddress(id),

      onSuccess: invalidate,
    }),

    // Dependents

    createDependent: useMutation({
      mutationFn: (data: CreateDependentDto) =>
        employeeService.createDependent(employeeId, data),

      onSuccess: invalidate,
    }),

    updateDependent: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateDependentDto }) =>
        employeeService.updateDependent(id, data),

      onSuccess: invalidate,
    }),

    deleteDependent: useMutation({
      mutationFn: (id: string) => employeeService.deleteDependent(id),

      onSuccess: invalidate,
    }),

    // Emergency Contacts

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
      }) => employeeService.updateEmergencyContact(id, data),

      onSuccess: invalidate,
    }),

    deleteEmergencyContact: useMutation({
      mutationFn: (id: string) => employeeService.deleteEmergencyContact(id),

      onSuccess: invalidate,
    }),

    // Visas

    createVisa: useMutation({
      mutationFn: (data: CreateVisaDto) =>
        employeeService.createVisa(employeeId, data),

      onSuccess: invalidate,
    }),

    updateVisa: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateVisaDto }) =>
        employeeService.updateVisa(id, data),

      onSuccess: invalidate,
    }),

    deleteVisa: useMutation({
      mutationFn: (id: string) => employeeService.deleteVisa(id),

      onSuccess: invalidate,
    }),
  }
}
