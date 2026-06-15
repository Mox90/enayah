// src/modules/hr/credentials/dto/credential.request.ts

import { z } from 'zod'

export const EmployeeCredentialParamSchema = z.object({
  employeeId: z.uuid(),
})

export const CredentialRecordIdSchema = z.object({
  id: z.uuid(),
})

export const CreateDegreeSchema = z.object({
  degreeName: z.string().trim().min(1),
  degreeType: z.enum([
    'diploma',
    'associate',
    'bachelor',
    'master',
    'doctorate',
    'other',
  ]),
  institution: z.string().trim().min(1),
  countryId: z.uuid().nullable().optional(),
  startDate: z.iso.date().nullable().optional(),
  endDate: z.iso.date().nullable().optional(),
  graduationDate: z.iso.date().nullable().optional(),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateDegreeSchema = CreateDegreeSchema.partial()

export const CreateBoardSchema = z.object({
  boardName: z.string().trim().trim().min(1).max(255),
  specialty: z.string().trim().trim().min(1).max(255),
  issuingBody: z.string().trim().trim(),
  issueDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date().nullable().optional(),
  isLifetime: z.boolean().default(false),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateBoardSchema = CreateBoardSchema.partial()

export const CreateFellowshipSchema = z.object({
  fellowshipName: z.string().trim().min(1).max(255),
  abbreviation: z.string().trim().max(50).nullable().optional(),
  issuingBody: z.string().trim().min(1).max(255),
  specialty: z.string().trim().max(255).nullable().optional(),
  issueDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date().nullable().optional(),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateFellowshipSchema = CreateFellowshipSchema.partial()

export const CreateMembershipSchema = z.object({
  organization: z.string().trim().min(1).max(255),
  membershipNumber: z.string().trim().max(100).nullable().optional(),
  membershipLevel: z.string().trim().max(100).nullable().optional(),
  startDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date().nullable().optional(),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateMembershipSchema = CreateMembershipSchema.partial()

export const CreateLicenseSchema = z.object({
  authority: z.string().trim().min(1).max(255),
  licenseNumber: z.string().trim().min(1).max(100),
  profession: z.string().trim().min(1).max(255),
  specialty: z.string().trim().max(255).nullable().optional(),
  issueDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date().nullable().optional(),
  status: z.enum(['active', 'expired', 'suspended', 'revoked']),
  isPrimary: z.boolean().default(false),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateLicenseSchema = CreateLicenseSchema.partial()

export const CreateLifeSupportSchema = z.object({
  type: z.enum([
    'bls', // Basic Life Support
    'acls', // Advanced Cardiovascular Life Support
    'pals', // Pediatric Advanced Life Support
    'atls', // Advanced Trauma Life Support
    'nrp', // Neonatal Resuscitation Program
    'itls', // International Trauma Life Support
    'blso', // Basic Life Support in Obstetrics
    'atcn', // Advanced Trauma Care for Nurses
    'also', // Advanced Life Support in Obstetrics
    'tncc', // Trauma Nursing Core Course
    'enpc', // Emergency Nursing Pediatric Course
    'asls', // Advanced Stroke Life Support
    'esls', // Essential Stroke Life Support
    'pfccs', // Pediatric Fundamental Critical Care Support
    'other',
  ]),
  provider: z.string().trim().min(1).max(255),
  certificateNumber: z.string().trim().max(100).nullable().optional(),
  issueDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date().nullable().optional(),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateLifeSupportSchema = CreateLifeSupportSchema.partial()

export const CreateMalpracticeSchema = z.object({
  insuranceCompany: z.string().trim().min(1).max(255),
  policyNumber: z.string().trim().min(1).max(100),
  issueDate: z.iso.date().nullable().optional(),
  expiryDate: z.iso.date(),
  documentFileId: z.uuid().nullable().optional(),
  isVerified: z.boolean().default(false),
  verifiedAt: z.iso.date().nullable().optional(),
  verifiedBy: z.uuid().nullable().optional(),
  verificationRemarks: z.string().trim().nullable().optional(),
})
export const UpdateMalpracticeSchema = CreateMalpracticeSchema.partial()

export const CreateEmployeeCredentialsSchema = z.object({
  degrees: z.array(CreateDegreeSchema).default([]),
  boards: z.array(CreateBoardSchema).default([]),
  fellowships: z.array(CreateFellowshipSchema).default([]),
  memberships: z.array(CreateMembershipSchema).default([]),
  licenses: z.array(CreateLicenseSchema).default([]),
  lifeSupport: z.array(CreateLifeSupportSchema).default([]),
  malpractice: z.array(CreateMalpracticeSchema).default([]),
})

export type CreateEmployeeCredentialsDto = z.infer<
  typeof CreateEmployeeCredentialsSchema
>
