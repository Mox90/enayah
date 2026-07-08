import {
  boolean,
  check,
  date,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { employees } from './hr'
import { baseColumns } from './base'
import { relations, sql } from 'drizzle-orm'
import {
  emailTypeEnum,
  genderEnum,
  identificationTypeEnum,
  phoneTypeEnum,
} from './enums'
import { countries } from './countries'
import { files } from './credentials'

export const employeeIdentifications = pgTable(
  'employee_identifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'cascade',
      }),
    type: identificationTypeEnum('identification_type').notNull(),
    identificationNumber: varchar('identification_number', {
      length: 30,
    }).notNull(),
    issueDate: date('issue_date'),
    expiryDate: date('expiry_date'),
    expiryDateHijri: varchar('expiry_date_hijri', { length: 10 }), // 1447-09-15
    issueDateHijri: varchar('issue_date_hijri', { length: 10 }),
    sponsor: varchar('sponsor', {
      length: 255,
    }),
    issuingAuthority: varchar('issuing_authority', {
      length: 100,
    }),
    occupation: varchar('occupation', {
      length: 150,
    }),
    isCurrent: boolean('is_current').default(true).notNull(),
    fileId: uuid('file_id').references(() => files.id),
    ...baseColumns,
  },
  (table) => ({
    validDateRange: check(
      'chk_employee_identification_valid_date_range',
      sql`${table.expiryDate} IS NULL
          OR ${table.issueDate} IS NULL
          OR ${table.expiryDate} >= ${table.issueDate}`,
    ),
    validHijriDateRange: check(
      'chk_employee_identification_valid_hijri_date_range',
      sql`${table.expiryDateHijri} IS NULL
          OR ${table.issueDateHijri} IS NULL
          OR ${table.expiryDateHijri} >= ${table.issueDateHijri}`,
    ),
  }),
)

export const employeeDependents = pgTable('employee_dependents', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  firstNameEn: varchar('first_name_en', {
    length: 100,
  }).notNull(),
  secondNameEn: varchar('second_name_en', {
    length: 100,
  }),
  thirdNameEn: varchar('third_name_en', {
    length: 100,
  }),
  familyNameEn: varchar('family_name_en', {
    length: 100,
  }).notNull(),
  firstNameAr: varchar('first_name_ar', {
    length: 100,
  }).notNull(),
  secondNameAr: varchar('second_name_ar', {
    length: 100,
  }),
  thirdNameAr: varchar('third_name_ar', {
    length: 100,
  }),
  familyNameAr: varchar('family_name_ar', {
    length: 100,
  }).notNull(),
  relationship: varchar('relationship', {
    length: 30,
  })
    .$type<'spouse' | 'child' | 'father' | 'mother' | 'other'>()
    .notNull(),
  gender: genderEnum('gender'),
  dateOfBirth: date('date_of_birth'),
  countryId: uuid('country_id').references(() => countries.id),
  ...baseColumns,
})

export const employeeAddresses = pgTable('employee_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  addressType: varchar('address_type', {
    length: 30,
  })
    .$type<'home' | 'mailing'>()
    .default('home')
    .notNull(),
  countryId: uuid('country_id').references(() => countries.id),
  city: varchar('city', {
    length: 100,
  }),
  district: varchar('district', {
    length: 100,
  }),
  street: varchar('street', {
    length: 255,
  }),
  building: varchar('building', {
    length: 100,
  }),
  stateProvince: varchar('state_province', {
    length: 100,
  }),
  postalCode: varchar('postal_code', {
    length: 20,
  }),
  additionalNumber: varchar('additional_number', {
    length: 20,
  }),
  ...baseColumns,
})

export const employeeEmergencyContacts = pgTable(
  'employee_emergency_contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, {
        onDelete: 'cascade',
      }),
    name: varchar('name', {
      length: 200,
    }).notNull(),
    relationship: varchar('relationship', {
      length: 50,
    }),
    mobile: varchar('mobile', {
      length: 30,
    }),
    alternateMobile: varchar('alternate_mobile', {
      length: 30,
    }),
    address: text('address'),
    ...baseColumns,
  },
)

export const employeeVisas = pgTable('employee_visas', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  visaNumber: varchar('visa_number', {
    length: 50,
  }),
  visaType: varchar('visa_type', {
    length: 100,
  }),
  issueDate: date('issue_date'),
  expiryDate: date('expiry_date'),
  isCurrent: boolean('is_current').default(true).notNull(),
  fileId: uuid('file_id').references(() => files.id),
  ...baseColumns,
})

export const employeeEmails = pgTable('employee_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  type: emailTypeEnum('type').default('personal').notNull(),
  email: varchar('email', {
    length: 255,
  }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  ...baseColumns,
})

export const employeePhoneNumbers = pgTable('employee_phone_numbers', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .notNull()
    .references(() => employees.id, {
      onDelete: 'cascade',
    }),
  type: phoneTypeEnum('type').default('mobile').notNull(),
  countryCode: varchar('country_code', {
    length: 10,
  }),
  phoneNumber: varchar('phone_number', {
    length: 30,
  }).notNull(),
  extension: varchar('extension', {
    length: 10,
  }),
  isPrimary: boolean('is_primary').default(false).notNull(),
  isWhatsapp: boolean('is_whatsapp').default(false).notNull(),
  ...baseColumns,
})

export const employeeAddressesRelations = relations(
  employeeAddresses,
  ({ one }) => ({
    country: one(countries, {
      fields: [employeeAddresses.countryId],
      references: [countries.id],
    }),
  }),
)
