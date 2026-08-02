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
  'retired',
  'on_leave',
  'suspended',
  'deceased',
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
  'stls', // Saudi Trauma Life Support
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

export const contractTypeEnum = pgEnum('contract_type', [
  'initial',
  'renewal',
  'amendment',
])

export const movementTypeEnum = pgEnum('movement_type', [
  'initial',
  'renewal',
  'promotion',
  'transfer',
  'demotion',
  'temporary_assignment',
  'acting',
  'amendment',
])

export const appointmentTypeEnum = pgEnum('appointment_type', [
  'primary',
  'acting',
  'temporary',
  'rotation',
  'secondment',
  'concurrent',
  'permanent_transfer',
])

export const assignmentReasonEnum = pgEnum('assignment_reason', [
  'organizational_restructuring',
  'temporary_coverage',
  'promotion',
  'management_decision',
  'acting_capacity',
  'rotation',
  'service_need',
])

export const contractStatusEnum = pgEnum('status', [
  'draft',
  'active',
  'superseded',
  'cancelled',
  'expired',
])

export const employeeDocumentTypeEnum = pgEnum('employee_document_type', [
  //-----------------------------------
  // Recruitment
  //-----------------------------------

  'cv',
  'job_application',
  'interview_evaluation',
  'offer_letter',

  //-----------------------------------
  // Employment
  //-----------------------------------

  'employment_contract',
  'contract_amendment',
  'contract_renewal',
  'appointment_letter',
  'job_description',
  'nda',

  //-----------------------------------
  // Identity
  //-----------------------------------

  'national_id',
  'iqama',
  'passport',
  'visa',
  'driving_license',
  'gcc_id',
  'other_identification',

  //-----------------------------------
  // Education
  //-----------------------------------

  'diploma',
  'transcript',
  'board_certificate',
  'fellowship_certificate',
  'training_certificate',

  //-----------------------------------
  // Professional License
  //-----------------------------------

  'professional_license',
  'saudi_council_registration',
  'home_country_license',

  //-----------------------------------
  // Life Support
  //-----------------------------------

  'bls_certificate',
  'acls_certificate',
  'pals_certificate',
  'atls_certificate',
  'life_support_other',

  //-----------------------------------
  // Verification
  //-----------------------------------

  'primary_source_verification',
  'background_check',
  'reference_check',
  'good_standing_certificate',

  //-----------------------------------
  // Medical
  //-----------------------------------

  'pre_employment_medical',
  'fit_to_work_certificate',
  'vaccination_record',
  'occupational_health_record',

  //-----------------------------------
  // Insurance
  //-----------------------------------

  'malpractice_insurance',
  'health_insurance',

  //-----------------------------------
  // Performance
  //-----------------------------------

  'orientation_certificate',
  'probation_evaluation',
  'performance_appraisal',

  //-----------------------------------
  // HR
  //-----------------------------------

  'promotion_letter',
  'transfer_letter',
  'disciplinary_action',
  'warning_letter',
  'termination_letter',
  'resignation_letter',
  'retirement_letter',

  //-----------------------------------
  // Leave
  //-----------------------------------

  'sick_leave_certificate',
  'maternity_leave_document',

  //-----------------------------------
  // Miscellaneous
  //-----------------------------------

  'other',
])

export const identificationTypeEnum = pgEnum('identification_type', [
  'national_id',
  'iqama',
  'gcc_id',
  'passport',
  'other',
])

export const emailTypeEnum = pgEnum('email_type', [
  'work',
  'personal',
  'secondary',
  'other',
])

export const phoneTypeEnum = pgEnum('phone_type', [
  'mobile',
  'work',
  'home',
  'fax',
  'other',
])

export const notificationSeverityEnum = pgEnum('notification_severity', [
  'info',
  'warning',
  'success',
  'error',
])

export const iqamaRenewalStatusEnum = pgEnum('iqama_renewal_status', [
  'pending_upload',
  'uploaded_to_mhrsd',
  'under_process',
  'approved_by_mhrsd',
  'denied_by_mhrsd',
  'sent_to_government_relations',
  'completed',
  'eoc_required',
  'cancelled',
])

export const fileVisibilityEnum = pgEnum('file_visibility', [
  'public',
  'private',
])

export const fileCategoryEnum = pgEnum('file_category', [
  'employee_avatar',
  'employee_degree',
  'employee_license',
  'employee_board',
  'employee_fellowship',
  'employee_membership',
  'employee_life_support',
  'employee_malpractice',
  'employee_identification',
  'employee_contract',
  'credential_verification_evidence',
  'other',
])

export const credentialVerificationCredentialTypeEnum = pgEnum(
  'credential_verification_credential_type',
  [
    'degree',
    'board',
    'fellowship',
    'membership',
    'license',
    'life_support',
    'malpractice',
  ],
)

export const credentialVerificationActionEnum = pgEnum(
  'credential_verification_action',
  ['verified', 'revoked'],
)
