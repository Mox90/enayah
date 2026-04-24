// employee.repository.ts
import { AppError } from '../../../../core/errors/AppError'
import { DB, db } from '../../../../db'
import { employees } from '../../../../db/schema/employees'
import { and, eq, sql } from 'drizzle-orm'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
import { PgTransaction } from 'drizzle-orm/pg-core'
import { DbOrTx, Executor, Tx } from '../../../../core/types/db.types'
import { toEmployeeDb, toEmployeeUpdateDb } from '../dto/employee.mapper'

//type DbOrTx = typeof db | PgTransaction<any, any, any>

const isActive = eq(employees.isDeleted, false)
const employeeWithRelations = {
  nationality: true,
} as const

function findByIdOrThrow(executor: DB, id: string): Promise<any>
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
  create: async (data: CreateEmployeeDto) => {
    //const [result] = await db.insert(employees).values(data).returning()
    //return result
    return db.transaction(async (tx) => {
      const [createdRaw] = await tx
        .insert(employees)
        .values(toEmployeeDb(data))
        .returning({ id: employees.id })

      /*if (!created) {
        throw new AppError('Failed to create employee', 500)
      }*/
      const created = assertExists(createdRaw, 'Failed to create employee')

      return findByIdOrThrow(tx, created.id)
    })
  },

  findAll: async () => {
    //return db.select().from(employees)
    return db.query.employees.findMany({
      where: isActive,
      with: employeeWithRelations,
    })
  },

  /*findByIds: async (id: string) => {
    const [result] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.isDeleted, false)))

    return result
  },*/

  findById: async (id: string) => {
    /*const result = await db.query.employees.findFirst({
      where: and(eq(employees.id, id), isActive),
      with: {
        nationality: true,
      },
    })*/

    return findByIdOrThrow(db, id)
  },

  update: async (id: string, data: UpdateEmployeeDto & { version: number }) => {
    /*const [updated] = await db
      .update(employees)
      .set({
        ...data,
        updatedAt: new Date(), // from baseColumns
        version: sql`${employees.version} + 1`,
      })
      .where(eq(employees.id, id))
      .returning()

    return updated*/
    return db.transaction(async (tx) => {
      const [updatedRaw] = await tx
        .update(employees)
        .set({
          ...toEmployeeUpdateDb(data),
          updatedAt: new Date(),
          version: sql`${employees.version} + 1`,
        })
        .where(and(eq(employees.id, id), eq(employees.version, data.version)))
        //.where(eq(employees.id, id))
        .returning({ id: employees.id })

      const updated = assertExists(
        updatedRaw,
        'Update failed: Employee not found or version conflict',
        409,
      )

      return findByIdOrThrow(tx, updated.id)
    })
  },
}
