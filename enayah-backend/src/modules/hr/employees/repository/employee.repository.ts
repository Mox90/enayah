// employee.repository.ts
import { AppError } from '../../../../core/errors/AppError'
import { DB, db, departments, employees, employments } from '../../../../db'
import { and, eq, sql } from 'drizzle-orm'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { toEmployeeDb, toEmployeeUpdateDb } from '../dto/employee.mapper'
import { Tx } from '../../../../core/types/db.types'

//type DbOrTx = typeof db | PgTransaction<any, any, any>

const isActive = eq(employees.isDeleted, false)
const employeeWithRelations = {
  nationality: true,
} as const

//function findByIdOrThrow(executor: DB, id: string): Promise<any>
function findByIdOrThrow(executor: DB | Tx, id: string): Promise<any>
async function findByIdOrThrow(executor: any, id: string) {
  const result = await executor.query.employees.findFirst({
    where: and(eq(employees.id, id), isActive),
    with: {
      nationality: true,
    },
  })

  if (!result) {
    throw new AppError('Employee not found', 404)
  }

  return result
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

  findRange: async (
    tx: DB,
    params: {
      offset: number
      limit: number
      search?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
  ) => {
    const { offset, limit } = params
    const whereClause = isActive
    const [items, totalResult] = await Promise.all([
      tx.query.employees.findMany({
        where: whereClause,
        orderBy: (e, { asc }) => [asc(e.employeeNumber)],
        with: employeeWithRelations,
        offset,
        limit,
      }),

      tx
        .select({
          count: sql<number>`count(*)`,
        })
        .from(employees)
        .where(whereClause),
    ])

    return {
      items,
      total: Number(totalResult[0]?.count ?? 0),
      offset,
      limit,
    }
  },

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

  findProfileBase: async (tx: DB, id: string) => {
    return tx.query.employees.findFirst({
      where: and(eq(employees.id, id), eq(employees.isDeleted, false)),
      with: {
        nationality: true,
      },
    })
  },

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
