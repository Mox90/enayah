// employee.repository.ts
import { AppError } from '../../../../core/errors/AppError'
import { DB, employees } from '../../../../db'
import { and, eq, sql } from 'drizzle-orm'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
//import { toEmployeeDb, toEmployeeUpdateDb } from '../dto/employee.mapper'
import { Tx } from '../../../../core/types/db.types'
import { toEmployeeDb, toEmployeeUpdateDb } from '../mapper/employee.db.mapper'

//type DbOrTx = typeof db | PgTransaction<any, any, any>

const isActive = eq(employees.isDeleted, false)
const employeeWithRelations = {
  nationality: true,
} as const

//function findByIdOrThrow(executor: DB, id: string): Promise<any>
// function findByIdOrThrow(executor: DB | Tx, id: string): Promise<any>
// async function findByIdOrThrow(executor: any, id: string) {
//   const result = await executor.query.employees.findFirst({
//     where: and(eq(employees.id, id), isActive),
//     with: {
//       nationality: true,
//     },
//   })

//   if (!result) {
//     throw new AppError('Employee not found', 404)
//   }

//   return result
// }

async function findByIdOrThrow(tx: DB, id: string) {
  const employee = await tx.query.employees.findFirst({
    where: and(eq(employees.id, id), isActive),

    with: {
      nationality: true,
    },
  })

  if (!employee) {
    throw new AppError('Employee not found', 404)
  }

  return employee
}

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

export const EmployeeRepository = {
  create: async (tx: DB, data: CreateEmployeeDto) => {
    const [createdRaw] = await tx
      .insert(employees)
      .values(toEmployeeDb(data))
      .returning({ id: employees.id })

    const created = assertExists(createdRaw, 'Failed to create employee')

    return findByIdOrThrow(tx, created.id)
  },

  findAll: async (tx: DB) => {
    return tx.query.employees.findMany({
      where: isActive,
      with: employeeWithRelations,
    })
  },

  findById: async (tx: DB, id: string) => {
    return findByIdOrThrow(tx, id)
  },

  // findRange: async (
  //   tx: DB,
  //   params: {
  //     offset: number
  //     limit: number
  //     search?: string
  //     sortBy?: string
  //     sortOrder?: 'asc' | 'desc'
  //   },
  // ) => {
  //   const { offset, limit } = params
  //   const whereClause = isActive
  //   const [items, totalResult] = await Promise.all([
  //     tx.query.employees.findMany({
  //       where: whereClause,
  //       orderBy: (e, { asc }) => [asc(e.employeeNumber)],
  //       with: employeeWithRelations,
  //       offset,
  //       limit,
  //     }),

  //     tx
  //       .select({
  //         count: sql<number>`count(*)`,
  //       })
  //       .from(employees)
  //       .where(whereClause),
  //   ])

  //   return {
  //     items,
  //     total: Number(totalResult[0]?.count ?? 0),
  //     offset,
  //     limit,
  //   }
  // },

  // findEmployeeDirectoryRange: async (
  //   tx: DB,
  //   params: EmployeeDirectoryQueryDto,
  // ) => {
  //   const {
  //     offset,
  //     limit,
  //     search,
  //     departmentIds,
  //     positionIds,
  //     categoryCodes,
  //     genders,
  //     nationalities,
  //     employmentStatuses,
  //     sortBy,
  //     sortOrder,
  //   } = params

  //   const conditions = [
  //     eq(employees.isDeleted, false),
  //     isNull(employees.deletedAt),
  //   ]

  //   // -----------------------------
  //   // Search
  //   // -----------------------------
  //   if (search) {
  //     conditions.push(
  //       or(
  //         ilike(employees.employeeNumber, `%${search}%`),

  //         ilike(employees.firstNameEn, `%${search}%`),

  //         ilike(employees.secondNameEn, `%${search}%`),

  //         ilike(employees.thirdNameEn, `%${search}%`),

  //         ilike(employees.familyNameEn, `%${search}%`),

  //         ilike(employees.firstNameAr, `%${search}%`),

  //         ilike(employees.secondNameAr, `%${search}%`),

  //         ilike(employees.thirdNameAr, `%${search}%`),

  //         ilike(employees.familyNameAr, `%${search}%`),
  //       )!,
  //     )
  //   }

  //   // -----------------------------
  //   // Gender
  //   // -----------------------------

  //   if (genders?.length) {
  //     conditions.push(inArray(employees.gender, genders as any[]))
  //     //conditions.push(inArray(employees.gender, genders))
  //   }

  //   // -----------------------------
  //   // Department
  //   // -----------------------------

  //   if (departmentIds?.length) {
  //     conditions.push(inArray(positionItems.departmentId, departmentIds))
  //   }

  //   // -----------------------------
  //   // Position
  //   // -----------------------------

  //   if (positionIds?.length) {
  //     conditions.push(inArray(positionItems.positionId, positionIds))
  //   }

  //   // -----------------------------
  //   // Category
  //   // -----------------------------

  //   if (categoryCodes?.length) {
  //     conditions.push(inArray(positionItems.categoryCode, categoryCodes))
  //   }

  //   // -----------------------------
  //   // Employment Status
  //   // -----------------------------

  //   if (employmentStatuses?.length) {
  //     conditions.push(inArray(employments.status, employmentStatuses as any[]))
  //     //conditions.push(inArray(employments.status, employmentStatuses))
  //   }

  //   // -----------------------------
  //   // Nationality
  //   // -----------------------------

  //   if (nationalities?.length) {
  //     conditions.push(inArray(countries.alpha2, nationalities))
  //   }

  //   const sortableColumns = {
  //     employeeNumber: employees.employeeNumber,
  //     hireDate: employments.hireDate,
  //     department: departments.nameEn,
  //     position: positions.titleEn,
  //     categoryCode: positionItems.categoryCode,
  //     nationality: countries.nationalityEn,
  //     gender: employees.gender,
  //     createdAt: employees.createdAt,
  //   }

  //   const sortColumn =
  //     sortableColumns[sortBy as keyof typeof sortableColumns] ??
  //     employees.employeeNumber

  //   const [items, totalResult] = await Promise.all([
  //     tx
  //       .select({
  //         id: employees.id,
  //         employeeNumber: employees.employeeNumber,
  //         firstNameEn: employees.firstNameEn,
  //         secondNameEn: employees.secondNameEn,
  //         thirdNameEn: employees.thirdNameEn,
  //         familyNameEn: employees.familyNameEn,
  //         firstNameAr: employees.firstNameAr,
  //         secondNameAr: employees.secondNameAr,
  //         thirdNameAr: employees.thirdNameAr,
  //         familyNameAr: employees.familyNameAr,
  //         gender: employees.gender,
  //         nationalityEn: countries.nationalityEn,
  //         nationalityAr: countries.nationalityAr,
  //         hireDate: employments.hireDate,
  //         employmentStatus: employments.status,
  //         pcn: positionItems.itemNumber,
  //         categoryCode: positionItems.categoryCode,
  //         workforceCategory: positionItems.workforceCategory,
  //         departmentId: departments.id,
  //         departmentNameEn: departments.nameEn,
  //         departmentNameAr: departments.nameAr,
  //         positionId: positions.id,
  //         positionTitleEn: positions.titleEn,
  //         positionTitleAr: positions.titleAr,
  //       })
  //       .from(employees)
  //       .leftJoin(countries, eq(employees.countryId, countries.id))
  //       .leftJoin(
  //         employments,
  //         and(
  //           eq(employments.employeeId, employees.id),
  //           eq(employments.status, 'active'),
  //         ),
  //       )
  //       .leftJoin(
  //         positionItems,
  //         eq(employments.positionItemId, positionItems.id),
  //       )
  //       .leftJoin(departments, eq(positionItems.departmentId, departments.id))
  //       .leftJoin(positions, eq(positionItems.positionId, positions.id))
  //       .where(and(...conditions))
  //       .orderBy(sortOrder == 'desc' ? desc(sortColumn) : asc(sortColumn))
  //       .offset(offset)
  //       .limit(limit),
  //     tx
  //       .select({
  //         count: sql<number>`count(*)`,
  //       })
  //       .from(employees)
  //       .leftJoin(countries, eq(employees.countryId, countries.id))
  //       .leftJoin(
  //         employments,
  //         and(
  //           eq(employments.employeeId, employees.id),
  //           eq(employments.status, 'active'),
  //         ),
  //       )
  //       .leftJoin(
  //         positionItems,
  //         eq(employments.positionItemId, positionItems.id),
  //       )
  //       .where(and(...conditions)),
  //   ])

  //   return {
  //     items,
  //     total: Number(totalResult[0]?.count ?? 0),
  //     offset,
  //     limit,
  //   }
  // },

  update: async (
    tx: DB,
    id: string,
    data: UpdateEmployeeDto & { version: number },
  ) => {
    const [updatedRaw] = await tx
      .update(employees)
      .set({
        ...toEmployeeUpdateDb(data),
        updatedAt: new Date(),
        version: sql`${employees.version} + 1`,
      })
      .where(and(eq(employees.id, id), eq(employees.version, data.version)))
      .returning({ id: employees.id })

    const updated = assertExists(updatedRaw, 'Update failed', 409)

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

    await tx
      .update(employees)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(eq(employees.id, id))

    return existing
  },

  // findProfileBase: async (tx: DB, id: string) => {
  //   const result = tx.query.employees.findFirst({
  //     where: and(eq(employees.id, id), isActive),
  //     with: {
  //       nationality: true,
  //     },
  //   })
  //   return assertExists(result, 'Employee not found', 404)
  // },

  // findHierarchy: async (tx: DB) => {
  //   return tx.query.departments.findMany({
  //     where: eq(departments.isDeleted, false),

  //     with: {
  //       positionItems: {
  //         with: {
  //           position: true,

  //           employments: {
  //             where: eq(employments.status, 'active'),

  //             with: {
  //               employee: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   })
  // },
}
