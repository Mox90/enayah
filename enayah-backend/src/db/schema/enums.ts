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
