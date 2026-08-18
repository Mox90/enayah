// enayah-backend/src/modules/hr/iqama-renewal-process/iqama-renewal-process.repository.ts

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  lte,
  ne,
  or,
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
import {
  startOfNextRiyadhDay,
  startOfRiyadhDay,
} from '../../../../core/utils/date'

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

const employeeNameEnExpression = sql<string | null>`
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
`

const employeeNameArExpression = sql<string | null>`
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
`

const employeeNameSortExpression = sql<string>`
  lower(
    coalesce(
      ${employeeNameEnExpression},
      ${employeeNameArExpression},
      ''
    )
  )
`

const currentStageSortExpression = sql<number>`
  case ${iqamaRenewalCases.status}
    when 'pending_upload' then 1
    when 'uploaded_to_mhrsd' then 2
    when 'under_process' then 3
    when 'approved_by_mhrsd' then 4
    when 'denied_by_mhrsd' then 5
    when 'sent_to_government_relations' then 6
    when 'eoc_required' then 7
    when 'completed' then 8
    when 'cancelled' then 9
    else 99
  end
`

const mhrsdDecisionSortExpression = sql<number>`
  case
    when ${iqamaRenewalCases.status} in (
      'approved_by_mhrsd',
      'sent_to_government_relations',
      'completed'
    ) then 1

    when ${iqamaRenewalCases.status} in (
      'denied_by_mhrsd',
      'eoc_required'
    ) then 2

    else 3
  end
`

const daysRemainingSortExpression = sql<number | null>`
  ${iqamaRenewalCases.governmentRelationsDueDate}
  - (now() at time zone 'Asia/Riyadh')::date
`

const searchableStatusExpression = sql<string>`
  replace(
    cast(${iqamaRenewalCases.status} as text),
    '_',
    ' '
  )
`

function normalizeSearchDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
}

const getOrderByExpression = (sortBy: ListIqamaRenewalCasesQuery['sortBy']) => {
  switch (sortBy) {
    case 'employeeNumber':
      return employees.employeeNumber

    case 'employeeName':
      return employeeNameSortExpression

    case 'iqamaNumber':
      return employeeIdentifications.identificationNumber

    case 'expiryDate':
      return employeeIdentifications.expiryDate

    case 'status':
      return currentStageSortExpression

    case 'mhrsdUploadedAt':
      return iqamaRenewalCases.mhrsdUploadedAt

    case 'mhrsdDecision':
      return mhrsdDecisionSortExpression

    case 'governmentRelationsDueDate':
      return iqamaRenewalCases.governmentRelationsDueDate

    case 'daysRemaining':
      return daysRemainingSortExpression

    case 'updatedAt':
      return iqamaRenewalCases.updatedAt

    case 'createdAt':
    default:
      return iqamaRenewalCases.createdAt
  }
}

const getOrderBy = (
  sortBy: ListIqamaRenewalCasesQuery['sortBy'],
  sortOrder: ListIqamaRenewalCasesQuery['sortOrder'],
) => {
  const expression = getOrderByExpression(sortBy)

  return sortOrder === 'asc'
    ? sql`${expression} asc nulls last`
    : sql`${expression} desc nulls last`
}

const escapeLikePattern = (value: string) => {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
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
        //employeeId: employees.id,
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
        //iqamaNumber: employeeIdentifications.identificationNumber,
        //expiryDate: employeeIdentifications.expiryDate,
        identification: {
          id: employeeIdentifications.id,
          type: employeeIdentifications.type,
          identificationNumber: employeeIdentifications.identificationNumber,
          issueDate: employeeIdentifications.issueDate,
          expiryDate: employeeIdentifications.expiryDate,
          issueDateHijri: employeeIdentifications.issueDateHijri,
          expiryDateHijri: employeeIdentifications.expiryDateHijri,
          //dateCalendar: employeeIdentifications.,
          sponsor: employeeIdentifications.sponsor,
          issuingAuthority: employeeIdentifications.issuingAuthority,
          occupation: employeeIdentifications.occupation,
          isCurrent: employeeIdentifications.isCurrent,
          documentFileId: employeeIdentifications.documentFileId,
        },
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
      // .leftJoin(
      //   employeeIdentifications,
      //   eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
      // )
      .innerJoin(
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

    //--------------------------------
    // Iqama expiry
    //--------------------------------

    if (query.expiryDateFrom) {
      conditions.push(
        gte(employeeIdentifications.expiryDate, query.expiryDateFrom),
      )
    }

    if (query.expiryDateTo) {
      conditions.push(
        lte(employeeIdentifications.expiryDate, query.expiryDateTo),
      )
    }

    //--------------------------------
    // MHRSD Uploaded
    //--------------------------------

    if (query.mhrsdUploadedFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.mhrsdUploadedAt,
          //startOfNextRiyadhDay(query.mhrsdUploadedFrom),
          startOfRiyadhDay(query.mhrsdUploadedFrom),
        ),
      )
    }

    if (query.mhrsdUploadedTo) {
      conditions.push(
        lt(
          iqamaRenewalCases.mhrsdUploadedAt,
          startOfNextRiyadhDay(query.mhrsdUploadedTo),
        ),
      )
    }

    //--------------------------------
    // MHRSD Approved
    //--------------------------------

    if (query.mhrsdApprovedFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.mhrsdApprovedAt,
          //startOfNextRiyadhDay(query.mhrsdApprovedFrom),
          startOfRiyadhDay(query.mhrsdApprovedFrom),
        ),
      )
    }

    if (query.mhrsdApprovedTo) {
      conditions.push(
        lt(
          iqamaRenewalCases.mhrsdApprovedAt,
          startOfNextRiyadhDay(query.mhrsdApprovedTo),
        ),
      )
    }

    //--------------------------------
    // MHRSD Denied
    //--------------------------------

    if (query.mhrsdDeniedFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.mhrsdDeniedAt,
          //startOfNextRiyadhDay(query.mhrsdDeniedFrom),
          startOfRiyadhDay(query.mhrsdDeniedFrom),
        ),
      )
    }

    if (query.mhrsdDeniedTo) {
      conditions.push(
        lt(
          iqamaRenewalCases.mhrsdDeniedAt,
          startOfNextRiyadhDay(query.mhrsdDeniedTo),
        ),
      )
    }

    //--------------------------------
    // Government Relations due date
    //--------------------------------

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

    //--------------------------------
    // Created
    //--------------------------------

    if (query.createdFrom) {
      conditions.push(
        gte(
          iqamaRenewalCases.createdAt,
          //startOfNextRiyadhDay(query.createdFrom),
          startOfRiyadhDay(query.createdFrom),
        ),
      )
    }

    if (query.createdTo) {
      conditions.push(
        lt(iqamaRenewalCases.createdAt, startOfNextRiyadhDay(query.createdTo)),
      )
    }

    if (query.search) {
      const normalizedSearch = normalizeSearchDigits(query.search)

      //const searchPattern = `%${normalizedSearch}%`
      const searchPattern = `%${escapeLikePattern(normalizedSearch)}%`

      const normalizedStatusSearch = normalizedSearch
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      //const statusPattern = `%${normalizedStatusSearch}%`
      const statusPattern = `%${escapeLikePattern(normalizedStatusSearch)}%`

      const searchCondition = or(
        ilike(employees.employeeNumber, searchPattern),

        ilike(employeeNameEnExpression, searchPattern),

        ilike(employeeNameArExpression, searchPattern),

        ilike(employeeIdentifications.identificationNumber, searchPattern),

        /*
         * Supports:
         * 2026-07-26
         */
        ilike(
          sql<string>`
        to_char(
          ${employeeIdentifications.expiryDate},
          'YYYY-MM-DD'
        )
      `,
          searchPattern,
        ),

        /*
         * Supports:
         * 26/07/2026
         */
        ilike(
          sql<string>`
        to_char(
          ${employeeIdentifications.expiryDate},
          'DD/MM/YYYY'
        )
      `,
          searchPattern,
        ),

        /*
         * Supports the displayed English format:
         * 26 Jul 2026
         */
        ilike(
          sql<string>`
        to_char(
          ${employeeIdentifications.expiryDate},
          'DD Mon YYYY'
        )
      `,
          searchPattern,
        ),

        /*
         * Allows:
         * approved_by_mhrsd
         * approved by mhrsd
         * under process
         * sent to government relations
         */
        ilike(searchableStatusExpression, statusPattern),
      )

      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    //const orderByColumn = getOrderByColumn(query.sortBy)

    //const orderBy = query.sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn)
    const orderBy = getOrderBy(query.sortBy, query.sortOrder)

    const [rows, totalResult] = await Promise.all([
      tx
        .select({
          ...getTableColumns(iqamaRenewalCases),

          employeeNumber: employees.employeeNumber,

          employeeNameEn: employeeNameEnExpression.as('employee_name_en'),

          employeeNameAr: employeeNameArExpression.as('employee_name_ar'),

          iqamaNumber: employeeIdentifications.identificationNumber,

          expiryDate: employeeIdentifications.expiryDate,

          assignedToName: sql<string | null>`
    coalesce(
      nullif(
        concat_ws(
          ' ',
          nullif(trim(${assignedEmployee.firstNameEn}), ''),
          nullif(trim(${assignedEmployee.secondNameEn}), ''),
          nullif(trim(${assignedEmployee.thirdNameEn}), ''),
          nullif(trim(${assignedEmployee.familyNameEn}), '')
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
        .leftJoin(employees, eq(employees.id, iqamaRenewalCases.employeeId))
        .leftJoin(
          employeeIdentifications,
          eq(employeeIdentifications.id, iqamaRenewalCases.identificationId),
        )
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
