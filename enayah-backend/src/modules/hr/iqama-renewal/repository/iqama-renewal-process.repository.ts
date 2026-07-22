// src/modules/hr/iqama-renewal-process/iqama-renewal-process.repository.ts

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNull,
  lte,
  ne,
  sql,
  type SQL,
} from 'drizzle-orm'

import {
  employeeIdentifications,
  employees,
  iqamaRenewalCases,
  users,
  type DB,
} from '../../../../db'

import {
  IqamaRenewalStatus,
  ListIqamaRenewalCasesQuery,
} from '../types/iqama-renewal-process.types'
import { alias } from 'drizzle-orm/pg-core'

type CreateCaseData = {
  employeeId: string
  identificationId: string
  status?: IqamaRenewalStatus
  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null
  notes?: string | null
  createdBy: string
  updatedBy: string
}

export type UpdateCaseData = Partial<{
  status?: IqamaRenewalStatus
  assignedToUserId?: string | null
  governmentRelationsDueDate?: string | null
  notes?: string | null
  denialReason?: string | null
  mhrsdUploadedAt?: Date | null
  mhrsdApprovedAt?: Date | null
  mhrsdDeniedAt?: Date | null
  updatedBy?: string
  updatedAt?: Date
}>

const normalizeStatuses = (
  status: ListIqamaRenewalCasesQuery['status'],
): IqamaRenewalStatus[] => {
  if (!status) return []

  return Array.isArray(status) ? status : [status]
}

const assignedEmployee = alias(employees, 'assigned_employee')

const getOrderByColumn = (sortBy: ListIqamaRenewalCasesQuery['sortBy']) => {
  switch (sortBy) {
    case 'updatedAt':
      return iqamaRenewalCases.updatedAt

    case 'status':
      return iqamaRenewalCases.status

    case 'governmentRelationsDueDate':
      return iqamaRenewalCases.governmentRelationsDueDate

    case 'createdAt':
    default:
      return iqamaRenewalCases.createdAt
  }
}

export const IqamaRenewalProcessRepository = {
  create: async (tx: DB, data: CreateCaseData) => {
    const [created] = await tx
      .insert(iqamaRenewalCases)
      .values({
        employeeId: data.employeeId,
        identificationId: data.identificationId,
        status: data.status ?? 'pending_upload',
        assignedToUserId: data.assignedToUserId ?? null,
        governmentRelationsDueDate: data.governmentRelationsDueDate ?? null,
        notes: data.notes ?? null,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      })
      .returning()

    return created
  },

  // findById: async (
  //   tx: DB,
  //   id: string,
  //   options?: {
  //     includeDeleted?: boolean
  //   },
  // ) => {
  //   const conditions = [eq(iqamaRenewalCases.id, id)]

  //   if (!options?.includeDeleted) {
  //     conditions.push(eq(iqamaRenewalCases.isDeleted, false))
  //   }

  //   const [record] = await tx
  //     .select({
  //       ...getTableColumns(iqamaRenewalCases),

  //       employeeNumber: employees.employeeNumber,

  //       employeeNameEn: sql<string | null>`
  //       nullif(
  //         concat_ws(
  //           ' ',
  //           nullif(trim(${employees.firstNameEn}), ''),
  //           nullif(trim(${employees.secondNameEn}), ''),
  //           nullif(trim(${employees.thirdNameEn}), ''),
  //           nullif(trim(${employees.familyNameEn}), '')
  //         ),
  //         ''
  //       )
  //     `.as('employee_name_en'),

  //       employeeNameAr: sql<string | null>`
  //       nullif(
  //         concat_ws(
  //           ' ',
  //           nullif(trim(${employees.firstNameAr}), ''),
  //           nullif(trim(${employees.secondNameAr}), ''),
  //           nullif(trim(${employees.thirdNameAr}), ''),
  //           nullif(trim(${employees.familyNameAr}), '')
  //         ),
  //         ''
  //       )
  //     `.as('employee_name_ar'),

  //       iqamaNumber: employeeIdentifications.identificationNumber,

  //       expiryDate: employeeIdentifications.expiryDate,

  //       assignedToName: users.username,
  //     })
  //     .from(iqamaRenewalCases)
  //     .leftJoin(employees, eq(employees.id, iqamaRenewalCases.employeeId))
  //     .leftJoin(
  //       employeeIdentifications,
  //       eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
  //     )
  //     .leftJoin(users, eq(users.id, iqamaRenewalCases.assignedToUserId))
  //     .where(and(...conditions))
  //     .limit(1)

  //   return record ?? null
  // },

  findById: async (
    tx: DB,
    id: string,
    options?: {
      includeDeleted?: boolean
    },
  ) => {
    const conditions = [eq(iqamaRenewalCases.id, id)]

    if (!options?.includeDeleted) {
      conditions.push(eq(iqamaRenewalCases.isDeleted, false))
    }

    const [record] = await tx
      .select({
        ...getTableColumns(iqamaRenewalCases),

        employeeNumber: employees.employeeNumber,

        employeeNameEn: sql<string | null>`
        nullif(
          concat_ws(
            ' ',
            nullif(trim(${employees.firstNameEn}), ''),
            nullif(trim(${employees.secondNameEn}), ''),
            nullif(trim(${employees.thirdNameEn}), ''),
            nullif(trim(${employees.familyNameEn}), '')
          ),
          ''
        )
      `.as('employee_name_en'),

        employeeNameAr: sql<string | null>`
        nullif(
          concat_ws(
            ' ',
            nullif(trim(${employees.firstNameAr}), ''),
            nullif(trim(${employees.secondNameAr}), ''),
            nullif(trim(${employees.thirdNameAr}), ''),
            nullif(trim(${employees.familyNameAr}), '')
          ),
          ''
        )
      `.as('employee_name_ar'),

        iqamaNumber: employeeIdentifications.identificationNumber,

        expiryDate: employeeIdentifications.expiryDate,

        assignedToName: sql<string | null>`
        coalesce(
          nullif(
            concat_ws(
              ' ',
              nullif(
                trim(${assignedEmployee.firstNameEn}),
                ''
              ),
              nullif(
                trim(${assignedEmployee.secondNameEn}),
                ''
              ),
              nullif(
                trim(${assignedEmployee.thirdNameEn}),
                ''
              ),
              nullif(
                trim(${assignedEmployee.familyNameEn}),
                ''
              )
            ),
            ''
          ),
          nullif(trim(${users.username}), '')
        )
      `.as('assigned_to_name'),
      })
      .from(iqamaRenewalCases)
      .leftJoin(employees, eq(employees.id, iqamaRenewalCases.employeeId))
      .leftJoin(
        employeeIdentifications,
        eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
      )
      .leftJoin(users, eq(users.id, iqamaRenewalCases.assignedToUserId))
      .leftJoin(assignedEmployee, eq(assignedEmployee.id, users.employeeId))
      .where(and(...conditions))
      .limit(1)

    return record ?? null
  },

  findOpenByIdentificationId: async (tx: DB, identificationId: string) => {
    const [record] = await tx
      .select()
      .from(iqamaRenewalCases)
      .where(
        and(
          eq(iqamaRenewalCases.identificationId, identificationId),
          eq(iqamaRenewalCases.isDeleted, false),
          ne(iqamaRenewalCases.status, 'completed'),
          ne(iqamaRenewalCases.status, 'cancelled'),
        ),
      )
      .limit(1)

    return record ?? null
  },

  // list: async (tx: DB, query: ListIqamaRenewalCasesQuery) => {
  //   const offset = (query.page - 1) * query.limit
  //   const statuses = normalizeStatuses(query.status)

  //   const conditions: SQL[] = []

  //   if (!query.includeDeleted) {
  //     conditions.push(eq(iqamaRenewalCases.isDeleted, false))
  //   }

  //   if (statuses.length === 1) {
  //     conditions.push(eq(iqamaRenewalCases.status, statuses[0]!))
  //   }

  //   if (statuses.length > 1) {
  //     conditions.push(inArray(iqamaRenewalCases.status, statuses))
  //   }

  //   if (query.employeeId) {
  //     conditions.push(eq(iqamaRenewalCases.employeeId, query.employeeId))
  //   }

  //   if (query.identificationId) {
  //     conditions.push(
  //       eq(iqamaRenewalCases.identificationId, query.identificationId),
  //     )
  //   }

  //   if (query.assignedToUserId) {
  //     conditions.push(
  //       eq(iqamaRenewalCases.assignedToUserId, query.assignedToUserId),
  //     )
  //   }

  //   if (query.unassigned) {
  //     conditions.push(isNull(iqamaRenewalCases.assignedToUserId))
  //   }

  //   if (query.governmentRelationsDueFrom) {
  //     conditions.push(
  //       gte(
  //         iqamaRenewalCases.governmentRelationsDueDate,
  //         query.governmentRelationsDueFrom,
  //       ),
  //     )
  //   }

  //   if (query.governmentRelationsDueTo) {
  //     conditions.push(
  //       lte(
  //         iqamaRenewalCases.governmentRelationsDueDate,
  //         query.governmentRelationsDueTo,
  //       ),
  //     )
  //   }

  //   if (query.createdFrom) {
  //     conditions.push(
  //       gte(
  //         iqamaRenewalCases.createdAt,
  //         new Date(`${query.createdFrom}T00:00:00.000Z`),
  //       ),
  //     )
  //   }

  //   if (query.createdTo) {
  //     conditions.push(
  //       lte(
  //         iqamaRenewalCases.createdAt,
  //         new Date(`${query.createdTo}T23:59:59.999Z`),
  //       ),
  //     )
  //   }

  //   const where = conditions.length > 0 ? and(...conditions) : undefined

  //   const orderByColumn = getOrderByColumn(query.sortBy)

  //   const orderBy =
  //     query.sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn)

  //   const [rows, totalResult] = await Promise.all([
  //     tx
  //       .select({
  //         ...getTableColumns(iqamaRenewalCases),
  //         employeeNumber: employees.employeeNumber,
  //         employeeNameEn: sql<string | null>`
  //       nullif(
  //         concat_ws(
  //           ' ',
  //           nullif(trim(${employees.firstNameEn}), ''),
  //           nullif(trim(${employees.secondNameEn}), ''),
  //           nullif(trim(${employees.thirdNameEn}), ''),
  //           nullif(trim(${employees.familyNameEn}), '')
  //         ),
  //         ''
  //       )
  //     `.as('employee_name_en'),
  //         employeeNameAr: sql<string | null>`
  //       nullif(
  //         concat_ws(
  //           ' ',
  //           nullif(trim(${employees.firstNameAr}), ''),
  //           nullif(trim(${employees.secondNameAr}), ''),
  //           nullif(trim(${employees.thirdNameAr}), ''),
  //           nullif(trim(${employees.familyNameAr}), '')
  //         ),
  //         ''
  //       )
  //     `.as('employee_name_ar'),
  //         iqamaNumber: employeeIdentifications.identificationNumber,
  //         expiryDate: employeeIdentifications.expiryDate,
  //         assignedToName: users.username,
  //       })
  //       .from(iqamaRenewalCases)
  //       .leftJoin(employees, eq(employees.id, iqamaRenewalCases.employeeId))
  //       .leftJoin(
  //         employeeIdentifications,
  //         eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
  //       )
  //       .leftJoin(users, eq(users.id, iqamaRenewalCases.assignedToUserId))
  //       .where(where)
  //       .orderBy(orderBy)
  //       .limit(query.limit)
  //       .offset(offset),

  //     tx
  //       .select({
  //         total: count(),
  //       })
  //       .from(iqamaRenewalCases)
  //       .where(where),
  //   ])

  //   const total = totalResult[0]?.total ?? 0

  //   const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)
  //   console.log(rows)
  //   return {
  //     data: rows,
  //     pagination: {
  //       page: query.page,
  //       limit: query.limit,
  //       total,
  //       totalPages,
  //       hasNextPage: query.page < totalPages,
  //       hasPreviousPage: query.page > 1,
  //     },
  //   }
  // },
  list: async (tx: DB, query: ListIqamaRenewalCasesQuery) => {
    const offset = (query.page - 1) * query.limit
    const statuses = normalizeStatuses(query.status)

    const conditions: SQL[] = []

    if (!query.includeDeleted) {
      conditions.push(eq(iqamaRenewalCases.isDeleted, false))
    }

    if (statuses.length === 1) {
      conditions.push(eq(iqamaRenewalCases.status, statuses[0]!))
    }

    if (statuses.length > 1) {
      conditions.push(inArray(iqamaRenewalCases.status, statuses))
    }

    if (query.employeeId) {
      conditions.push(eq(iqamaRenewalCases.employeeId, query.employeeId))
    }

    if (query.identificationId) {
      conditions.push(
        eq(iqamaRenewalCases.identificationId, query.identificationId),
      )
    }

    if (query.assignedToUserId) {
      conditions.push(
        eq(iqamaRenewalCases.assignedToUserId, query.assignedToUserId),
      )
    }

    if (query.unassigned) {
      conditions.push(isNull(iqamaRenewalCases.assignedToUserId))
    }

    if (query.governmentRelationsDueFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.governmentRelationsDueDate,
          query.governmentRelationsDueFrom,
        ),
      )
    }

    if (query.governmentRelationsDueTo) {
      conditions.push(
        lte(
          iqamaRenewalCases.governmentRelationsDueDate,
          query.governmentRelationsDueTo,
        ),
      )
    }

    if (query.createdFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.createdAt,
          new Date(`${query.createdFrom}T00:00:00.000Z`),
        ),
      )
    }

    if (query.createdTo) {
      conditions.push(
        lte(
          iqamaRenewalCases.createdAt,
          new Date(`${query.createdTo}T23:59:59.999Z`),
        ),
      )
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const orderByColumn = getOrderByColumn(query.sortBy)

    const orderBy =
      query.sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn)

    const [rows, totalResult] = await Promise.all([
      tx
        .select({
          ...getTableColumns(iqamaRenewalCases),

          employeeNumber: employees.employeeNumber,

          employeeNameEn: sql<string | null>`
            nullif(
              concat_ws(
                ' ',
                nullif(trim(${employees.firstNameEn}), ''),
                nullif(trim(${employees.secondNameEn}), ''),
                nullif(trim(${employees.thirdNameEn}), ''),
                nullif(trim(${employees.familyNameEn}), '')
              ),
              ''
            )
          `.as('employee_name_en'),

          employeeNameAr: sql<string | null>`
            nullif(
              concat_ws(
                ' ',
                nullif(trim(${employees.firstNameAr}), ''),
                nullif(trim(${employees.secondNameAr}), ''),
                nullif(trim(${employees.thirdNameAr}), ''),
                nullif(trim(${employees.familyNameAr}), '')
              ),
              ''
            )
          `.as('employee_name_ar'),

          iqamaNumber: employeeIdentifications.identificationNumber,

          expiryDate: employeeIdentifications.expiryDate,

          /*
           * Return the assigned employee's full English name.
           *
           * Fallback behavior:
           * 1. Assigned employee full name
           * 2. User username
           * 3. null when no assigned user exists
           */
          assignedToName: sql<string | null>`
            coalesce(
              nullif(
                concat_ws(
                  ' ',
                  nullif(
                    trim(${assignedEmployee.firstNameEn}),
                    ''
                  ),
                  nullif(
                    trim(${assignedEmployee.secondNameEn}),
                    ''
                  ),
                  nullif(
                    trim(${assignedEmployee.thirdNameEn}),
                    ''
                  ),
                  nullif(
                    trim(${assignedEmployee.familyNameEn}),
                    ''
                  )
                ),
                ''
              ),
              nullif(trim(${users.username}), '')
            )
          `.as('assigned_to_name'),
        })
        .from(iqamaRenewalCases)

        /*
         * Employee whose Iqama is being renewed.
         */
        .leftJoin(employees, eq(employees.id, iqamaRenewalCases.employeeId))

        /*
         * Iqama identification record.
         */
        .leftJoin(
          employeeIdentifications,
          eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
        )

        /*
         * User assigned to process the renewal.
         */
        .leftJoin(users, eq(users.id, iqamaRenewalCases.assignedToUserId))

        /*
         * Employee record associated with the assigned user.
         *
         * When users.employeeId is null, this left join produces
         * null employee fields and assignedToName falls back to
         * users.username.
         */
        .leftJoin(assignedEmployee, eq(assignedEmployee.id, users.employeeId))

        .where(where)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(offset),

      tx
        .select({
          total: count(),
        })
        .from(iqamaRenewalCases)
        .where(where),
    ])

    const total = totalResult[0]?.total ?? 0

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)

    return {
      data: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    }
  },

  updateWithVersion: async (
    tx: DB,
    id: string,
    version: number,
    data: UpdateCaseData,
  ) => {
    const [updated] = await tx
      .update(iqamaRenewalCases)
      .set({
        ...data,
        updatedAt: data.updatedAt ?? new Date(),
        version: version + 1,
      })
      .where(
        and(
          eq(iqamaRenewalCases.id, id),
          eq(iqamaRenewalCases.version, version),
          eq(iqamaRenewalCases.isDeleted, false),
        ),
      )
      .returning()

    return updated ?? null
  },

  softDeleteWithVersion: async (
    tx: DB,
    id: string,
    version: number,
    deletedBy: string,
  ) => {
    const now = new Date()

    const [deleted] = await tx
      .update(iqamaRenewalCases)
      .set({
        isDeleted: true,
        deletedAt: now,
        deletedBy,
        updatedAt: now,
        updatedBy: deletedBy,
        version: version + 1,
      })
      .where(
        and(
          eq(iqamaRenewalCases.id, id),
          eq(iqamaRenewalCases.version, version),
          eq(iqamaRenewalCases.isDeleted, false),
        ),
      )
      .returning()

    return deleted ?? null
  },
}
