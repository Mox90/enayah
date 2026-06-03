import { pgEnum } from 'drizzle-orm/pg-core'

export const authProviderEnum = pgEnum('auth_providers', [
  'local',
  'ldap',
  'oauth2',
  'saml',
  'openid',
])

export const genderEnum = pgEnum('gender', ['male', 'female', 'not_specified'])

export const appraisalRatingEnum = pgEnum('appraisal_rating', [
  'outstanding',
  'very_good',
  'good',
  'needs_improvement',
  'unsatisfactory',
])

export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'locum',
])

export const staffCategoryEnum = pgEnum('staff_category', [
  'civilian',
  'military',
  'contractual',
])

export const workforceCategoryEnum = pgEnum('workforce_category', [
  'physician', // 1000
  'nurse', // 2000
  'allied_health', // 3000
  'administrative', // 4000
  'support_service', // 5000
])

export const employmentStatusEnum = pgEnum('employment_status', [
  'active',
  'terminated',
  'resigned',
  'eoc',
  'transferred',
  'on_leave',
])

export const appraisalStatusEnum = pgEnum('appraisal_status', [
  'draft',
  'planning_submitted',
  'planning_acknowledged',
  'evaluation_in_progress',
  'submitted',
  'manager_review',
  'hr_review',
  'calibrated',
  'closed',
])

export const degreeTypeEnum = pgEnum('degree_type', [
  'diploma',
  'associate',
  'bachelor',
  'master',
  'doctorate',
  'other',
])

export const licenseStatusEnum = pgEnum('license_status', [
  'active',
  'expired',
  'suspended',
  'revoked',
])

export const lifeSupportTypeEnum = pgEnum('life_support_type', [
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
])

export const employeeDocumentTypeEnum = pgEnum(
  'employee_document_type',

  [
    // Recruitment
    'cv',
    'job_application',
    'interview_evaluation',

    // Employment
    'job_offer_acceptance',
    'letter_of_appointment',
    'employment_contract',
    'job_description',
    'non_disclosure_agreement',

    // Verification
    'primary_source_verification',
    'background_check',
    'reference_check',

    // Occupational Health
    'pre_employment_medical',
    'fit_to_work_certificate',
    'vaccination_record',

    // Leave
    'sick_leave_certificate',
    'maternity_leave_document',

    // Identity
    'national_id',
    'iqama',
    'passport',

    // Other
    'other',
  ],
)
