// enayah-backend/src/modules/hr/credentials/dto/credential.request.ts

import { z } from 'zod'

import { AppError } from '../../../../core/errors/AppError'

/*
 * --------------------------------------------------------------------------
 * Route parameter schemas
 * --------------------------------------------------------------------------
 */

export const EmployeeCredentialParamSchema = z.object({
  employeeId: z.uuid(),
})

export const CredentialRecordIdSchema = z.object({
  id: z.uuid(),
})

export const EmployeeCredentialRecordParamSchema = z.object({
  employeeId: z.uuid(),
  id: z.uuid(),
})

/*
 * --------------------------------------------------------------------------
 * Shared field helpers
 * --------------------------------------------------------------------------
 */

function optionalNullableText(maxLength: number) {
  return z
    .union([z.string().trim().max(maxLength), z.literal(''), z.null()])
    .optional()
    .transform((value) => value || null)
}

const optionalNullableDate = z
  .union([z.iso.date(), z.literal(''), z.null()])
  .optional()
  .transform((value) => value || null)

const optionalNullableUuid = z
  .union([z.uuid(), z.literal(''), z.null()])
  .optional()
  .transform((value) => value || null)

/*
 * --------------------------------------------------------------------------
 * Degree
 * --------------------------------------------------------------------------
 *
 * Server-managed fields intentionally excluded:
 *
 * - documentFileId
 * - isVerified
 * - verifiedAt
 * - verifiedBy
 * - verificationRemarks
 */

export const CreateDegreeSchema = z
  .object({
    degreeName: z
      .string()
      .trim()
      .min(1, 'Degree name is required.')
      .max(255, 'Degree name must not exceed 255 characters.'),

    degreeType: z.enum([
      'diploma',
      'associate',
      'bachelor',
      'master',
      'doctorate',
      'other',
    ]),

    major: optionalNullableText(255),

    institution: z
      .string()
      .trim()
      .min(1, 'Institution is required.')
      .max(255, 'Institution must not exceed 255 characters.'),

    countryId: optionalNullableUuid,

    graduationDate: optionalNullableDate,
  })
  .strict()

export const UpdateDegreeSchema = CreateDegreeSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Board
 * --------------------------------------------------------------------------
 */

export const CreateBoardSchema = z
  .object({
    boardName: z.string().trim().min(1, 'Board name is required.').max(255),
    specialty: z.string().trim().min(1, 'Specialty is required.').max(255),
    issuingBody: z.string().trim().min(1, 'Issuing body is required.').max(255),
    issueDate: optionalNullableDate,
    expiryDate: optionalNullableDate,
    isLifetime: z.boolean().default(false),
  })
  .strict()

export const UpdateBoardSchema = CreateBoardSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Fellowship
 * --------------------------------------------------------------------------
 */

export const CreateFellowshipSchema = z
  .object({
    fellowshipName: z
      .string()
      .trim()
      .min(1, 'Fellowship name is required.')
      .max(255),
    abbreviation: optionalNullableText(50),
    issuingBody: z.string().trim().min(1, 'Issuing body is required.').max(255),
    specialty: optionalNullableText(255),
    issueDate: optionalNullableDate,
    expiryDate: optionalNullableDate,
  })
  .strict()

export const UpdateFellowshipSchema = CreateFellowshipSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Membership
 * --------------------------------------------------------------------------
 */

export const CreateMembershipSchema = z
  .object({
    organization: z
      .string()
      .trim()
      .min(1, 'Organization is required.')
      .max(255),
    membershipNumber: optionalNullableText(100),
    membershipLevel: optionalNullableText(100),
    startDate: optionalNullableDate,
    expiryDate: optionalNullableDate,
  })
  .strict()

export const UpdateMembershipSchema = CreateMembershipSchema.partial()

/*
 * --------------------------------------------------------------------------
 * License
 * --------------------------------------------------------------------------
 */

export const CreateLicenseSchema = z
  .object({
    authority: z
      .string()
      .trim()
      .min(1, 'Licensing authority is required.')
      .max(255),
    licenseNumber: z
      .string()
      .trim()
      .min(1, 'License number is required.')
      .max(100),
    profession: z.string().trim().min(1, 'Profession is required.').max(255),
    specialty: optionalNullableText(255),
    issueDate: optionalNullableDate,
    expiryDate: optionalNullableDate,
    status: z.enum(['active', 'expired', 'suspended', 'revoked']),
    isPrimary: z.boolean().default(false),
  })
  .strict()

export const UpdateLicenseSchema = CreateLicenseSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Life-support certification
 * --------------------------------------------------------------------------
 */

export const CreateLifeSupportSchema = z
  .object({
    type: z.enum([
      'bls',
      'acls',
      'pals',
      'atls',
      'nrp',
      'itls',
      'blso',
      'atcn',
      'also',
      'tncc',
      'enpc',
      'asls',
      'esls',
      'pfccs',
      'other',
    ]),
    provider: z.string().trim().min(1, 'Provider is required.').max(255),
    certificateNumber: optionalNullableText(100),
    issueDate: optionalNullableDate,
    expiryDate: optionalNullableDate,
  })
  .strict()

export const UpdateLifeSupportSchema = CreateLifeSupportSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Malpractice insurance
 * --------------------------------------------------------------------------
 */

export const CreateMalpracticeSchema = z
  .object({
    insuranceCompany: z
      .string()
      .trim()
      .min(1, 'Insurance company is required.')
      .max(255),
    policyNumber: z
      .string()
      .trim()
      .min(1, 'Policy number is required.')
      .max(100),
    issueDate: optionalNullableDate,
    expiryDate: z.iso.date(),
  })
  .strict()

export const UpdateMalpracticeSchema = CreateMalpracticeSchema.partial()

/*
 * --------------------------------------------------------------------------
 * Bulk credential metadata
 * --------------------------------------------------------------------------
 *
 * This schema remains JSON-based.
 *
 * It creates credential metadata only. Actual files should be uploaded using
 * the individual credential endpoints after each credential record exists.
 */

export const CreateEmployeeCredentialsSchema = z
  .object({
    degrees: z.array(CreateDegreeSchema).default([]),
    boards: z.array(CreateBoardSchema).default([]),
    fellowships: z.array(CreateFellowshipSchema).default([]),
    memberships: z.array(CreateMembershipSchema).default([]),
    licenses: z.array(CreateLicenseSchema).default([]),
    lifeSupport: z.array(CreateLifeSupportSchema).default([]),
    malpractice: z.array(CreateMalpracticeSchema).default([]),
  })
  .strict()

/*
 * --------------------------------------------------------------------------
 * Multipart parser
 * --------------------------------------------------------------------------
 *
 * Examples:
 *
 * degree:
 *   parseCredentialMultipartBody(
 *     request.body,
 *     'degree',
 *     CreateDegreeSchema,
 *   )
 *
 * board:
 *   parseCredentialMultipartBody(
 *     request.body,
 *     'board',
 *     CreateBoardSchema,
 *   )
 */

export function parseCredentialMultipartBody<TSchema extends z.ZodType>(
  body: unknown,
  fieldName: string,
  schema: TSchema,
): z.infer<TSchema> {
  if (!body || typeof body !== 'object') {
    throw new AppError(`${fieldName} data is required.`, 400)
  }

  const bodyRecord = body as Record<string, unknown>

  const fieldValue = bodyRecord[fieldName]

  if (typeof fieldValue !== 'string') {
    throw new AppError(
      `${fieldName} data must be provided as a JSON string.`,
      400,
    )
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(fieldValue)
  } catch {
    throw new AppError(`${fieldName} data contains invalid JSON.`, 422)
  }

  return schema.parse(parsedValue)
}

/*
 * --------------------------------------------------------------------------
 * DTO types
 * --------------------------------------------------------------------------
 */

export type CreateDegreeDto = z.infer<typeof CreateDegreeSchema>

export type UpdateDegreeDto = z.infer<typeof UpdateDegreeSchema>

export type CreateBoardDto = z.infer<typeof CreateBoardSchema>

export type UpdateBoardDto = z.infer<typeof UpdateBoardSchema>

export type CreateFellowshipDto = z.infer<typeof CreateFellowshipSchema>

export type UpdateFellowshipDto = z.infer<typeof UpdateFellowshipSchema>

export type CreateMembershipDto = z.infer<typeof CreateMembershipSchema>

export type UpdateMembershipDto = z.infer<typeof UpdateMembershipSchema>

export type CreateLicenseDto = z.infer<typeof CreateLicenseSchema>

export type UpdateLicenseDto = z.infer<typeof UpdateLicenseSchema>

export type CreateLifeSupportDto = z.infer<typeof CreateLifeSupportSchema>

export type UpdateLifeSupportDto = z.infer<typeof UpdateLifeSupportSchema>

export type CreateMalpracticeDto = z.infer<typeof CreateMalpracticeSchema>

export type UpdateMalpracticeDto = z.infer<typeof UpdateMalpracticeSchema>

export type CreateEmployeeCredentialsDto = z.infer<
  typeof CreateEmployeeCredentialsSchema
>

export const EmployeeCredentialVerificationEventParamSchema = z.object({
  employeeId: z.uuid(),
  id: z.uuid(),
  eventId: z.uuid(),
})

export const UpdateCredentialVerificationSchema = z
  .object({
    isVerified: z.boolean(),
    remarks: z
      .string()
      .trim()
      .max(1000, 'Verification remarks must not exceed 1000 characters.')
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, context) => {
    const remarks = data.remarks?.trim()

    if (!data.isVerified && !remarks) {
      context.addIssue({
        code: 'custom',
        path: ['remarks'],
        message: 'A reason is required when revoking verification.',
      })
    }
  })

export type UpdateCredentialVerificationDto = z.infer<
  typeof UpdateCredentialVerificationSchema
>
