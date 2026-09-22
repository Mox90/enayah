// enayah-backend/src/modules/hr/offboarding/config/separation-reasons.config.ts

import { employmentSeparationTypeValues } from '../../../../db'

export const employmentSeparationReasonValues = [
  // EOC / resignation / mutual agreement
  'standard_expiry',
  'higher_pay',
  'alternative_opportunity',
  'lack_recognition',
  'lack_training_opportunities',
  'limited_career_advancement',
  'lack_professional_development_support',
  'supervisor_management',
  'workload',
  'type_of_work',
  'employee_conflict',
  'work_environment',
  'relocation',
  'study',
  'personal_family',
  'employer_nonrenewal',
  'amicable_separation',
  'resignation_during_probation',

  // Termination
  'restructuring',
  'redundancy',
  'layoff',
  'misconduct_cause',
  'probation_nonconfirmation',

  // Retirement
  'statutory_age_retirement',
  'early_retirement',

  // Transfer out
  'transfer_other_facility',
  'transfer_other_entity',

  // Death
  'death_of_employee',

  // Other
  'medical_unfitness',
  'force_majeure',
  'work_permit_revocation',
  'legal_invalidation',
  'corporate_dissolution',
] as const

export type EmploymentSeparationReasonCode =
  (typeof employmentSeparationReasonValues)[number]

export type EmploymentSeparationType =
  (typeof employmentSeparationTypeValues)[number]

interface SeparationTypeConfig {
  requiresNoticeDate: boolean
  presetReasons: readonly EmploymentSeparationReasonCode[]
}

export const separationTypeConfigs = {
  eoc: {
    requiresNoticeDate: false,
    presetReasons: [
      'standard_expiry',
      'employer_nonrenewal',
      'higher_pay',
      'alternative_opportunity',
      'supervisor_management',
      'workload',
      'lack_recognition',
      'lack_training_opportunities',
      'limited_career_advancement',
      'lack_professional_development_support',
      'type_of_work',
      'employee_conflict',
      'work_environment',
      'relocation',
      'study',
      'personal_family',
    ],
  },

  resignation: {
    requiresNoticeDate: true,
    presetReasons: [
      'higher_pay',
      'alternative_opportunity',
      'supervisor_management',
      'workload',
      'lack_recognition',
      'lack_training_opportunities',
      'limited_career_advancement',
      'lack_professional_development_support',
      'type_of_work',
      'employee_conflict',
      'work_environment',
      'relocation',
      'study',
      'personal_family',
      'resignation_during_probation',
    ],
  },

  mutual_agreement: {
    requiresNoticeDate: false,
    presetReasons: [
      'amicable_separation',
      'alternative_opportunity',
      'personal_family',
    ],
  },

  termination: {
    requiresNoticeDate: true,
    presetReasons: [
      'restructuring',
      'redundancy',
      'layoff',
      'misconduct_cause',
      'probation_nonconfirmation',
    ],
  },

  retirement: {
    requiresNoticeDate: false,
    presetReasons: ['statutory_age_retirement', 'early_retirement'],
  },

  transfer_out: {
    requiresNoticeDate: false,
    presetReasons: ['transfer_other_facility', 'transfer_other_entity'],
  },

  death: {
    requiresNoticeDate: false,
    presetReasons: ['death_of_employee'],
  },

  other: {
    requiresNoticeDate: false,
    presetReasons: [
      'medical_unfitness',
      'force_majeure',
      'work_permit_revocation',
      'legal_invalidation',
      'corporate_dissolution',
    ],
  },
} satisfies Record<EmploymentSeparationType, SeparationTypeConfig>
