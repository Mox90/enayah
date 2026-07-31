import { z } from 'zod'

export const PersonalRecordIdSchema = z.object({
  employeeId: z.uuid(),
  recordId: z.uuid(),
})

export const EmployeePersonalEmployeeIdSchema = z.object({
  employeeId: z.uuid(),
})

// ----------------------------------
// Shared
// ----------------------------------

const optionalDate = z.iso.date().nullable().optional()
const optionalUuid = z.uuid().nullable().optional()

// ----------------------------------
// Identification
// ----------------------------------

const normalizeDigits = (value: string): string =>
  value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
// const normalizeDigits = (value: string): string =>
//   value.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (digit) => {
//     const code = digit.codePointAt(0)!
//     const base = code >= 0x06f0 ? 0x06f0 : 0x0660
//     return String(code - base)
//   })

const optionalHijriDate = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return value
    }

    if (typeof value === 'string') {
      const normalized = normalizeDigits(value.trim())

      return normalized === '' ? undefined : normalized
    }

    return value
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: 'Hijri date must use YYYY-MM-DD format',
    })
    .nullable()
    .optional(),
)

type IdentificationType =
  | 'national_id'
  | 'iqama'
  | 'gcc_id'
  | 'passport'
  | 'other'

type IdentificationValidationInput = {
  type?: IdentificationType | undefined
  identificationNumber?: string | undefined
}

type IdentificationDateInput = {
  issueDate?: string | null | undefined
  expiryDate?: string | null | undefined
}

const validateIdentificationDates = (
  value: IdentificationDateInput,
  ctx: z.RefinementCtx,
): void => {
  if (
    value.issueDate &&
    value.expiryDate &&
    value.issueDate > value.expiryDate
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['expiryDate'],
      message: 'Expiry date must not be earlier than issue date',
    })
  }
}

const validateIdentification = (
  value: IdentificationValidationInput,
  ctx: z.RefinementCtx,
): void => {
  if (value.type !== 'iqama' || value.identificationNumber === undefined) {
    return
  }

  const normalizedNumber = normalizeDigits(value.identificationNumber.trim())

  if (!/^[A-Za-z0-9-]+$/.test(normalizedNumber)) {
    ctx.addIssue({
      code: 'custom',
      path: ['identificationNumber'],
      message: 'Iqama number may contain only letters, numbers, and hyphens',
    })
  }
}

export const EmployeeIdentificationSchema = z
  .object({
    type: z.enum(['national_id', 'iqama', 'gcc_id', 'passport', 'other']),

    identificationNumber: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .transform(normalizeDigits),

    issueDate: optionalDate,
    issueDateHijri: optionalHijriDate,

    expiryDate: optionalDate,
    expiryDateHijri: optionalHijriDate,

    sponsor: z.string().trim().max(255).nullable().optional(),
    issuingAuthority: z.string().trim().max(100).nullable().optional(),
    occupation: z.string().trim().max(150).nullable().optional(),

    isCurrent: z.boolean().default(true),
    fileId: optionalUuid,
  })
  .superRefine(validateIdentification)
  .superRefine(validateIdentificationDates)

export const UpdateEmployeeIdentificationSchema = z
  .object({
    type: z
      .enum(['national_id', 'iqama', 'gcc_id', 'passport', 'other'])
      .optional(),

    identificationNumber: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .transform(normalizeDigits)
      .optional(),

    issueDate: optionalDate,
    issueDateHijri: optionalHijriDate,

    expiryDate: optionalDate,
    expiryDateHijri: optionalHijriDate,

    sponsor: z.string().trim().max(255).nullable().optional(),
    issuingAuthority: z.string().trim().max(100).nullable().optional(),
    occupation: z.string().trim().max(150).nullable().optional(),

    isCurrent: z.boolean().optional(),
    fileId: optionalUuid,
  })
  .refine((value) => Object.keys(value).length > 0, {
    error: 'At least one field is required',
  })
  .superRefine(validateIdentification)
  .superRefine(validateIdentificationDates)

export type EmployeeIdentificationDto = z.infer<
  typeof EmployeeIdentificationSchema
>

export type UpdateEmployeeIdentificationDto = z.infer<
  typeof UpdateEmployeeIdentificationSchema
>

// ----------------------------------
// Email
// ----------------------------------

export const EmployeeEmailSchema = z.object({
  type: z.enum(['work', 'personal', 'secondary', 'other']).default('personal'),

  email: z.email().max(255),

  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
})

//export const UpdateEmployeeEmailSchema = EmployeeEmailSchema.partial()
export const UpdateEmployeeEmailSchema = z
  .object({
    type: z.enum(['work', 'personal', 'secondary', 'other']).optional(),
    email: z.email().max(255).optional(),
    isPrimary: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'At least one field is required',
  })

export type EmployeeEmailDto = z.infer<typeof EmployeeEmailSchema>

export type UpdateEmployeeEmailDto = z.infer<typeof UpdateEmployeeEmailSchema>

// ----------------------------------
// Phone Number
// ----------------------------------

export const EmployeePhoneNumberSchema = z.object({
  type: z.enum(['mobile', 'work', 'home', 'fax', 'other']).default('mobile'),
  countryCode: z.string().trim().max(10).nullable().optional(),
  phoneNumber: z.string().trim().min(5).max(30),
  extension: z.string().trim().max(10).nullable().optional(),
  isPrimary: z.boolean().default(false),
  isWhatsapp: z.boolean().default(false),
})

//export const UpdateEmployeePhoneNumberSchema =
//  EmployeePhoneNumberSchema.partial()
export const UpdateEmployeePhoneNumberSchema = z
  .object({
    type: z.enum(['mobile', 'work', 'home', 'fax', 'other']).optional(),
    countryCode: z.string().trim().max(10).nullable().optional(),
    phoneNumber: z.string().trim().min(5).max(30).optional(),
    extension: z.string().trim().max(10).nullable().optional(),
    isPrimary: z.boolean().default(false).optional(),
    isWhatsapp: z.boolean().default(false).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'At least one field is required',
  })

export type EmployeePhoneNumberDto = z.infer<typeof EmployeePhoneNumberSchema>

export type UpdateEmployeePhoneNumberDto = z.infer<
  typeof UpdateEmployeePhoneNumberSchema
>

// ----------------------------------
// Dependent
// ----------------------------------

export const EmployeeDependentSchema = z.object({
  firstNameEn: z.string().trim().min(1).max(100),
  secondNameEn: z.string().trim().max(100).nullable().optional(),
  thirdNameEn: z.string().trim().max(100).nullable().optional(),
  familyNameEn: z.string().trim().min(1).max(100),

  firstNameAr: z.string().trim().min(1).max(100),
  secondNameAr: z.string().trim().max(100).nullable().optional(),
  thirdNameAr: z.string().trim().max(100).nullable().optional(),
  familyNameAr: z.string().trim().min(1).max(100),

  relationship: z.enum(['spouse', 'child', 'father', 'mother', 'other']),
  gender: z.enum(['male', 'female', 'not_specified']).nullable().optional(),
  dateOfBirth: optionalDate,
  countryId: optionalUuid,
})

export const UpdateEmployeeDependentSchema = EmployeeDependentSchema.partial()

export type EmployeeDependentDto = z.infer<typeof EmployeeDependentSchema>

export type UpdateEmployeeDependentDto = z.infer<
  typeof UpdateEmployeeDependentSchema
>

// ----------------------------------
// Address
// ----------------------------------

export const EmployeeAddressSchema = z.object({
  addressType: z.enum(['home', 'mailing']).default('home'),

  countryId: optionalUuid,

  city: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  stateProvince: z.string().trim().max(100).nullable().optional(),
  street: z.string().trim().max(255).nullable().optional(),
  building: z.string().trim().max(100).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  additionalNumber: z.string().trim().max(20).nullable().optional(),
})

//export const UpdateEmployeeAddressSchema = EmployeeAddressSchema.partial()
export const UpdateEmployeeAddressSchema = z
  .object({
    addressType: z.enum(['home', 'mailing']).optional(),
    countryId: optionalUuid,
    city: z.string().trim().max(100).nullable().optional(),
    district: z.string().trim().max(100).nullable().optional(),
    stateProvince: z.string().trim().max(100).nullable().optional(),
    street: z.string().trim().max(255).nullable().optional(),
    building: z.string().trim().max(100).nullable().optional(),
    postalCode: z.string().trim().max(20).nullable().optional(),
    additionalNumber: z.string().trim().max(20).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'At least one field is required',
  })

export type EmployeeAddressDto = z.infer<typeof EmployeeAddressSchema>

export type UpdateEmployeeAddressDto = z.infer<
  typeof UpdateEmployeeAddressSchema
>

// ----------------------------------
// Emergency Contact
// ----------------------------------

export const EmployeeEmergencyContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  relationship: z.string().trim().max(50).nullable().optional(),
  mobile: z.string().trim().max(30).nullable().optional(),
  alternateMobile: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().nullable().optional(),
})

export const UpdateEmployeeEmergencyContactSchema =
  EmployeeEmergencyContactSchema.partial()

export type EmployeeEmergencyContactDto = z.infer<
  typeof EmployeeEmergencyContactSchema
>

export type UpdateEmployeeEmergencyContactDto = z.infer<
  typeof UpdateEmployeeEmergencyContactSchema
>

// ----------------------------------
// Visa
// ----------------------------------

export const EmployeeVisaSchema = z.object({
  visaNumber: z.string().trim().max(50).nullable().optional(),
  visaType: z.string().trim().max(100).nullable().optional(),
  issueDate: optionalDate,
  expiryDate: optionalDate,
  isCurrent: z.boolean().default(true),
  fileId: optionalUuid,
})

//export const UpdateEmployeeVisaSchema = EmployeeVisaSchema.partial()
export const UpdateEmployeeVisaSchema = z
  .object({
    visaNumber: z.string().trim().max(50).nullable().optional(),
    visaType: z.string().trim().max(100).nullable().optional(),
    issueDate: optionalDate,
    expiryDate: optionalDate,
    isCurrent: z.boolean().default(true).optional(),
    fileId: optionalUuid,
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'At least one field is required',
  })

export type EmployeeVisaDto = z.infer<typeof EmployeeVisaSchema>

export type UpdateEmployeeVisaDto = z.infer<typeof UpdateEmployeeVisaSchema>

// ----------------------------------
// Create All Personal Details
// ----------------------------------

export const CreateEmployeePersonalSchema = z.object({
  identifications: z.array(EmployeeIdentificationSchema).default([]),
  emails: z.array(EmployeeEmailSchema).default([]),
  phoneNumbers: z.array(EmployeePhoneNumberSchema).default([]),
  dependents: z.array(EmployeeDependentSchema).default([]),
  addresses: z.array(EmployeeAddressSchema).default([]),
  emergencyContacts: z.array(EmployeeEmergencyContactSchema).default([]),
  visas: z.array(EmployeeVisaSchema).default([]),
})

export type CreateEmployeePersonalDto = z.infer<
  typeof CreateEmployeePersonalSchema
>
