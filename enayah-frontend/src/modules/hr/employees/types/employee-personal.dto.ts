// employee-personal.dto.ts

import type {
  Address,
  Dependent,
  Email,
  EmergencyContact,
  Identification,
  PhoneNumber,
  Visa,
} from './employee-personal-details.types'

export type CreateIdentificationDto = Omit<Identification, 'id'>
export type UpdateIdentificationDto = Partial<CreateIdentificationDto>

export type CreatePhoneDto = Omit<PhoneNumber, 'id'>
export type UpdatePhoneDto = Partial<CreatePhoneDto>

export type CreateEmailDto = Omit<Email, 'id'>
export type UpdateEmailDto = Partial<CreateEmailDto>

export type CreateAddressDto = Omit<Address, 'id'>
export type UpdateAddressDto = Partial<CreateAddressDto>

export type CreateDependentDto = Omit<Dependent, 'id'>
export type UpdateDependentDto = Partial<CreateDependentDto>

export type CreateEmergencyContactDto = Omit<EmergencyContact, 'id'>
export type UpdateEmergencyContactDto = Partial<CreateEmergencyContactDto>

export type CreateVisaDto = Omit<Visa, 'id'>
export type UpdateVisaDto = Partial<CreateVisaDto>
