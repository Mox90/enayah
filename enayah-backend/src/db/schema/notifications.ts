import {
  boolean,
  date,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { baseColumns } from './base'
import { employees } from './hr'
import { iqamaRenewalStatusEnum, notificationSeverityEnum } from './enums'
import { users } from './users'
import { employeeIdentifications } from './employeePersonalInformation'
import { relations } from 'drizzle-orm'

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employees.id, {
      onDelete: 'set null',
    }),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
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
  ({ one }) => ({
    employee: one(employees, {
      fields: [iqamaRenewalCases.employeeId],
      references: [employees.id],
    }),

    identification: one(employeeIdentifications, {
      fields: [iqamaRenewalCases.identificationId],
      references: [employeeIdentifications.id],
    }),

    assignedTo: one(users, {
      fields: [iqamaRenewalCases.assignedToUserId],
      references: [users.id],
    }),
  }),
)
