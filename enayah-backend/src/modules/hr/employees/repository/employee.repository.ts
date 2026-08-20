// enayah-backend/src/modules/hr/employees/repository/employee.repository.ts

import { AppError } from '../../../../core/errors/AppError'
import { DB, employees, files, users } from '../../../../db'
import { and, eq, sql } from 'drizzle-orm'
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'
//import { toEmployeeDb, toEmployeeUpdateDb } from '../dto/employee.mapper'
import { Tx } from '../../../../core/types/db.types'
import { toEmployeeDb, toEmployeeUpdateDb } from '../mapper/employee.db.mapper'
import { alias } from 'drizzle-orm/pg-core'

//type DbOrTx = typeof db | PgTransaction<any, any, any>

const isActive = eq(employees.isDeleted, false)
const employeeWithRelations = {
  nationality: true,
} as const

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
}
