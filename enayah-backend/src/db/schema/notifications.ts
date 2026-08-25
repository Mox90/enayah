import {
  AnyPgColumn,
  boolean,
  check,
  date,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { employees } from './hr'
import { iqamaRenewalStatusEnum, notificationSeverityEnum } from './enums'
import { users } from './users'
import { employeeIdentifications } from './employeePersonalInformation'
import { relations, sql } from 'drizzle-orm'

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employees.id, {
      onDelete: 'set null',
    }),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    titleAr: varchar('title_ar', { length: 255 }).notNull(),
    message: text('message').notNull(),
    messageAr: text('message_ar').notNull(),
    sourceType: varchar('source_type', { length: 50 }).notNull(),
    sourceId: uuid('source_id').notNull(),
    dueDate: date('due_date'),
    severity: notificationSeverityEnum('severity').default('info').notNull(),
    metadata: jsonb('metadata'),
    ...baseColumns,
  },
  (table) => ({
    sourceIdx: index('notifications_source_idx').on(
      table.sourceType,
      table.sourceId,
    ),
  }),
)

export const notificationRecipients = pgTable(
  'notification_recipients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at'),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userInboxIdx: index('notification_recipients_user_inbox_idx').on(
      table.recipientUserId,
      table.isArchived,
      table.isRead,
    ),
  }),
)

export const notificationEvents = pgTable(
  'notification_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceType: varchar('source_type', { length: 50 }).notNull(),
    sourceId: uuid('source_id').notNull(),
    milestone: varchar('milestone', { length: 20 }).notNull(),
    notificationId: uuid('notification_id').references(() => notifications.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },

  (table) => ({
    uniqueEvent: unique('uq_notification_event').on(
      table.sourceType,
      table.sourceId,
      table.milestone,
    ),
    eventSourceIdx: index('notification_events_source_idx').on(
      table.sourceType,
      table.sourceId,
    ),
  }),
)

export const iqamaRenewalCases = pgTable(
  'iqama_renewal_cases',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    identificationId: uuid('identification_id')
      .notNull()
      .references(() => employeeIdentifications.id, { onDelete: 'cascade' }),
    status: iqamaRenewalStatusEnum('status')
      .default('pending_upload')
      .notNull(),
    mhrsdUploadedAt: timestamp('mhrsd_uploaded_at'),
    mhrsdApprovedAt: timestamp('mhrsd_approved_at'),
    mhrsdDeniedAt: timestamp('mhrsd_denied_at'),
    governmentRelationsDueDate: date('government_relations_due_date'),
    notes: text('notes'),
    denialReason: text('denial_reason'),
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
    ...baseColumns,
  },

  (table) => ({
    uniqueActiveIqamaCase: unique('uq_iqama_renewal_case_identification').on(
      table.identificationId,
    ),
    employeeIdx: index('idx_iqama_renewal_cases_employee').on(table.employeeId),
    statusIdx: index('idx_iqama_renewal_cases_status').on(table.status),
  }),
)

export const iqamaRenewalCaseComments = pgTable(
  'iqama_renewal_case_comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    caseId: uuid('case_id')
      .notNull()
      .references(() => iqamaRenewalCases.id, {
        onDelete: 'cascade',
      }),

    authorUserId: uuid('author_user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'restrict',
      }),

    /*
     * Null means this is a top-level comment.
     *
     * When populated, this is the exact comment being replied to.
     */
    parentCommentId: uuid('parent_comment_id').references(
      (): AnyPgColumn => iqamaRenewalCaseComments.id,
    ),

    /*
     * Null for top-level comments.
     *
     * Every reply points to the top-level comment of the thread.
     * This makes loading and grouping threaded replies inexpensive.
     */
    threadRootId: uuid('thread_root_id').references(
      (): AnyPgColumn => iqamaRenewalCaseComments.id,
    ),

    body: text('body').notNull(),

    statusAtTime: iqamaRenewalStatusEnum('status_at_time').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },

  (table) => [
    /*
     * PostgreSQL requires the referenced composite columns to have
     * a unique constraint/index.
     *
     * This permits the composite self-referencing foreign keys below.
     */
    //unique('uq_iqama_comment_id_case').on(table.id, table.caseId),

    /*
     * Ensures the parent comment belongs to the same case.
     */
    // foreignKey({
    //   name: 'fk_iqama_comment_parent_same_case',
    //   columns: [table.parentCommentId, table.caseId],
    //   foreignColumns: [table.id, table.caseId],
    // }),
    //.onDelete('restrict'),

    /*
     * Ensures the thread root also belongs to the same case.
     */
    // foreignKey({
    //   name: 'fk_iqama_comment_thread_root_same_case',
    //   columns: [table.threadRootId, table.caseId],
    //   foreignColumns: [table.id, table.caseId],
    // }),
    //.onDelete('restrict'),

    index('idx_iqama_comments_case_created_at').on(
      table.caseId,
      table.createdAt,
    ),

    index('idx_iqama_comments_parent').on(table.parentCommentId),

    index('idx_iqama_comments_thread_created_at').on(
      table.threadRootId,
      table.createdAt,
    ),

    index('idx_iqama_comments_author').on(table.authorUserId),

    check(
      'chk_iqama_comment_body_length',
      sql`
        char_length(btrim(${table.body})) between 1 and 2000
      `,
    ),

    /*
     * Top-level:
     *   parentCommentId = null
     *   threadRootId = null
     *
     * Reply:
     *   both are populated
     */
    check(
      'chk_iqama_comment_thread_fields',
      sql`
        (
          ${table.parentCommentId} is null
          and ${table.threadRootId} is null
        )
        or
        (
          ${table.parentCommentId} is not null
          and ${table.threadRootId} is not null
        )
      `,
    ),
  ],
)

export const notificationsRelations = relations(
  notifications,
  ({ one, many }) => ({
    employee: one(employees, {
      fields: [notifications.employeeId],
      references: [employees.id],
    }),
    recipients: many(notificationRecipients),
    events: many(notificationEvents),
  }),
)

export const notificationRecipientsRelations = relations(
  notificationRecipients,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationRecipients.notificationId],
      references: [notifications.id],
    }),
    recipient: one(users, {
      fields: [notificationRecipients.recipientUserId],
      references: [users.id],
    }),
  }),
)

export const notificationEventsRelations = relations(
  notificationEvents,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationEvents.notificationId],
      references: [notifications.id],
    }),
  }),
)

export const iqamaRenewalCasesRelations = relations(
  iqamaRenewalCases,
  ({ one, many }) => ({
    employee: one(employees, {
      fields: [iqamaRenewalCases.employeeId],
      references: [employees.id],
    }),

    identification: one(employeeIdentifications, {
      fields: [iqamaRenewalCases.identificationId],
      references: [employeeIdentifications.id],
    }),

    assignedToUser: one(users, {
      fields: [iqamaRenewalCases.assignedToUserId],
      references: [users.id],
    }),

    comments: many(iqamaRenewalCaseComments),
  }),
)

export const iqamaRenewalCaseCommentsRelations = relations(
  iqamaRenewalCaseComments,
  ({ one }) => ({
    renewalCase: one(iqamaRenewalCases, {
      fields: [iqamaRenewalCaseComments.caseId],
      references: [iqamaRenewalCases.id],
    }),

    author: one(users, {
      fields: [iqamaRenewalCaseComments.authorUserId],
      references: [users.id],
    }),
  }),
)
