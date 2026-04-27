import {
  pgTable,
  uuid,
  numeric,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  check,
  date,
  uniqueIndex,
  integer,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { appraisalRatingEnum, appraisalStatusEnum } from './enums'
import { sql } from 'drizzle-orm'
import { employees } from './hr'
//import { appraisalCycles } from './appraisalCycles'

export const appraisalCycles = pgTable(
  'appraisal_cycles',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 150 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),

    status: varchar('status', { length: 30 }),
  },
  (table) => ({
    validDateRange: check(
      'chk_appraisal_valid_date_range',
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  }),
)

export const employeeAppraisals = pgTable(
  'employee_appraisals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'restrict' }),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => appraisalCycles.id, { onDelete: 'restrict' }),
    appraiserId: uuid('appraiser_id').references(() => employees.id),
    goalSectionWeight: numeric('goal_section_weight'), // e.g. 0.5 or 0.4 or 0.7
    competencySectionWeight: numeric('competency_section_weight'), // 0.5 or 0.6 or 0.3
    finalScore: numeric('final_score'),
    overallRating: appraisalRatingEnum('overall_rating'),
    status: appraisalStatusEnum('appraisal_status').default('draft').notNull(),

    strengths: jsonb('strengths').$type<string[]>(),
    developmentAreas: jsonb('development_areas').$type<string[]>(),
    comments: text('comments'),
    //pip: jsonb('pip'),

    // 🟢 PLANNING SIGNATURES
    planningSubmittedAt: timestamp('planning_submitted_at'),
    planningSubmittedBy: uuid('planning_submitted_by'),

    //acknowledgedAt: timestamp('acknowledged_at'),
    //acknowledgedBy: uuid('acknowledged_by'),

    planningAcknowledgedAt: timestamp('planning_acknowledged_at'),
    planningAcknowledgedBy: uuid('planning_acknowledged_by'),

    // 🔵 FINAL SIGNATURES
    finalSubmittedAt: timestamp('final_submitted_at'),
    finalSubmittedBy: uuid('final_submitted_by'),

    finalAcknowledgedAt: timestamp('final_acknowledged_at'),
    finalAcknowledgedBy: uuid('final_acknowledged_by'),

    // 🟣 HR
    hrApprovedAt: timestamp('hr_approved_at'),
    hrApprovedBy: uuid('hr_approved_by'),

    // OPTIONAL
    isRejected: boolean('is_rejected').notNull().default(false),
    rejectionReason: text('rejection_reason'),

    calibratedAt: timestamp('calibrated_at'),
    calibratedBy: uuid('calibrated_by'),

    managerSignedAt: timestamp('manager_signed_at'),
    managerSignedBy: uuid('manager_signed_by'),

    employeeSignedAt: timestamp('employee_signed_at'),
    employeeSignedBy: uuid('employee_signed_by'),

    aiGenerated: boolean('ai_generated').notNull().default(false),

    ...baseColumns,
  },
  (table) => ({
    uniqueEmployeeCycle: uniqueIndex('ux_employee_appraisal_employee_cycle')
      .on(table.employeeId, table.cycleId)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
)

export const appraisalOutcomes = pgTable('appraisal_outcomes', {
  id: uuid('id').defaultRandom().primaryKey(),

  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'cascade' }),

  recommendedAction: varchar('recommended_action', { length: 50 }), // promotion, increment
  salaryIncreasePercent: numeric('salary_increase_percent'),

  newPositionId: uuid('new_position_id'),

  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
})

export const appraisalGoals = pgTable('appraisal_goals', {
  id: uuid('id').defaultRandom().primaryKey(),

  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'cascade' }),

  goalTitle: varchar('goal_title', { length: 255 }).notNull(),

  measurementStandard: text('measurement_standard'),
  relativeWeight: numeric('relative_weight'), // e.g. 30%
  targetOutput: varchar('target_output', { length: 255 }),

  // evaluation
  score: integer('score'), // 1–5
  comments: varchar('comments', { length: 500 }),

  ...baseColumns,
})

export const appraisalCompetencies = pgTable('appraisal_competencies', {
  id: uuid('id').defaultRandom().primaryKey(),

  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, {
      onDelete: 'cascade',
    }),

  //domainName: varchar('domain_name', { length: 150 }).notNull(),
  competencyId: uuid('competency_id')
    .notNull()
    .references(() => competencyLibrary.id),

  relativeWeight: numeric('relative_weight'), // e.g. 30%

  score: integer('score'), // 1–5
  //comments: varchar('comments', { length: 500 }),

  ...baseColumns,
})

export const competencyLibrary = pgTable('competency_library', {
  id: uuid('id').defaultRandom().primaryKey(),

  domainEn: varchar('domain_en', { length: 255 }).notNull(), // Champion Change & Innovation, Communication with Impact, Collaborate & Build Relationship
  domainAr: varchar('domain_ar', { length: 255 }).notNull(), // إدارة التغيير والإبداع , التواصل المؤثر , التعاون و بناء العلاقات
})

export const competencyThemes = pgTable('competency_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  competencyId: uuid('competency_id')
    .notNull()
    .references(() => competencyLibrary.id, { onDelete: 'cascade' }),
  themeNameEn: varchar('theme_name_en', { length: 255 }).notNull(),
  themeNameAr: varchar('theme_name_ar', { length: 255 }).notNull(),
  behavioralDescriptionEn: text('behavioral_description_en'),
  behavioralDescriptionAr: text('behavioral_description_ar'),
})

export const appraisalInsights = pgTable('appraisal_insights', {
  id: uuid('id').defaultRandom().primaryKey(),

  appraisalId: uuid('appraisal_id')
    .notNull()
    .references(() => employeeAppraisals.id, { onDelete: 'cascade' }),

  type: varchar('type', { length: 50 }),
  // strength | development | risk | recommendation

  category: varchar('category', { length: 100 }),
  // e.g. communication, leadership, technical

  description: text('description').notNull(),

  source: varchar('source', { length: 50 }).default('ai'),
  // ai | manager | hr

  confidenceScore: numeric('confidence_score'), // optional AI %

  createdAt: timestamp('created_at').defaultNow(),

  /*
    To feature:
    •	Query top weaknesses across hospital
	•	Track recurring issues
	•	Audit AI vs manager decisions
  */
})

export const performanceImprovementPlans = pgTable(
  'pips',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    appraisalId: uuid('appraisal_id')
      .notNull()
      .references(() => employeeAppraisals.id),

    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id),

    reason: text('reason'),

    startDate: date('start_date'),
    endDate: date('end_date'),

    status: varchar('status', { length: 30 }),
    // active, completed, failed

    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    validDateRange: check(
      'chk_performance_improvement_plans_valid_date_range',
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  }),
)

export const pipActions = pgTable('pip_actions', {
  id: uuid('id').defaultRandom().primaryKey(),

  pipId: uuid('pip_id')
    .notNull()
    .references(() => performanceImprovementPlans.id, {
      onDelete: 'cascade',
    }),

  action: text('action'), // e.g. attend training, coaching

  dueDate: timestamp('due_date'),

  status: varchar('status', { length: 30 }), // pending, done

  remarks: text('remarks'),
})

export const trainingNeeds = pgTable('training_needs', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id),

  appraisalId: uuid('appraisal_id').references(() => employeeAppraisals.id),

  competencyId: uuid('competency_id').references(() => competencyLibrary.id),

  priority: varchar('priority', { length: 20 }), // high, medium, low

  reason: text('reason'),

  status: varchar('status', { length: 30 }), // planned, ongoing, completed

  createdAt: timestamp('created_at').defaultNow(),
})

export const trainingPrograms = pgTable('training_programs', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name', { length: 255 }),
  description: text('description'),

  provider: varchar('provider', { length: 150 }),

  durationHours: numeric('duration_hours'),
})

export const employeeTrainings = pgTable('employee_trainings', {
  id: uuid('id').defaultRandom().primaryKey(),

  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id),

  trainingId: uuid('training_id').references(() => trainingPrograms.id),

  trainingNeedId: uuid('training_need_id').references(() => trainingNeeds.id),

  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),

  status: varchar('status', { length: 30 }), // enrolled, completed

  result: varchar('result', { length: 50 }), // pass, fail
})

/*

HOW YOUR AI FLOW SHOULD WORK

STEP 1 — Analyze Scores

if (goal.score <= 2) → development
if (goal.score >= 4.5) → strength

STEP 2 — Generate Insights

insert into: appraisalInsights

STEP 3 — Trigger PIP

If:
	•	low competency
	•	repeated weakness
	•	poor final score

create: performanceImprovementPlans

STEP 4 — Trigger Training

From insights:

insert into: trainingNeeds

STEP 5 — Assign Training

HR links: employeeTrainings

FINAL FLOW (IMPORTANT)

            Appraisal
                ↓
        Goals + Competencies
                ↓
            AI Insights
                ↓
 ┌───────────────┬───────────────┐
 ▼               ▼
PIP           Training Needs
                 ↓
           Training Programs
                 ↓
           Employee Training

*/
