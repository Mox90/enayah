import { z } from 'zod'

export const createLegalDocumentSchema = z.object({
  employmentId: z.uuid(),

  //type: z.enum(['iqama', 'passport', 'visa', 'scfhs_license']),
  type: z.enum([
    'Iqama',
    'Passport',
    'Visa',
    'Saudi Commission for Health Specialties License',
    'Saudi Nurse Association Membership',
    'Home Country License',
    'Malpractice Insurance',
    'Basic Life Support Certification',
    'Advanced Cardiac Life Support Certification',
    'Pediatric Advanced Life Support Certification',
    'Advanced Trauma Life Support Certification',
    'Saudi Trauma Life Support Certification',
    'Advanced Life Support in Obstetrics Certification',
    'Basic Life Support in Obstetrics Certification',
    'Neonatal Resuscitation Program Certification',
    'Advanced Trauma Care for Nurses Certification',
    'Prehospital Trauma Life Support',
    'International Trauma Life Support',
    'Trauma Nursing Core Course Certification',
    'Anaesthesia Trauma and Critical Care Certification',
    'Infection Control Certification',
    'Fire Safety Certification',
    'Hazardous Materials Handling Certification',
    'Privileges',
    'Credentialing',
    'Other',
  ]),

  documentNumber: z.string().min(1).optional(),

  issueDate: z.iso.date().optional(),
  expiryDate: z.iso.date().optional(),

  issuingAuthority: z.string().optional(),

  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateLegalDocumentDto = z.infer<typeof createLegalDocumentSchema>
