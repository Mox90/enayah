import { InferInsertModel } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { db, employments } from '../../../../db'
import {
  toPositionItemDB,
  toPositionItemResponse,
} from '../dto/positionItem.mapper'
import { PositionItemRepository } from '../repository/positionItem.repository'
import { validatePositionItemAssignment } from '../validators/positionItem.validator'
import { EmployeeRepository } from '../../employees/repository/employee.repository'
import {
  CreatePositionItemDTO,
  UpdatePositionItemDTO,
} from '../dto/positionItem.request'

type EmploymentInsert = InferInsertModel<typeof employments>

export const PositionItemService = {
  assignEmployee: async (positionItemId: string, employeeId: string) => {
    const today = new Date().toISOString().split('T')[0]!

    return db.transaction(async (tx) => {
      // 🔥 1. atomic check + update
      const item = await PositionItemRepository.assignIfAvailable(
        positionItemId,
        tx as any, // pass transaction
      )

      // 🔥 2. insert employment
      await tx.insert(employments).values({
        employeeId,
        positionItemId,
        hireDate: today,
        startDate: today,
      })

      return { message: 'Employee assigned successfully' }
    })
  },

  create: async (data: CreatePositionItemDTO) => {
    return db.transaction((tx) => PositionItemRepository.create(tx, data))
  },

  findAll: async () => {
    return db.transaction((tx) => PositionItemRepository.findAll(tx))
  },

  findById: async (id: string) => {
    return db.transaction((tx) => PositionItemRepository.findById(tx, id))
  },

  /*update: async (id: string, data: UpdatePositionItemDTO) => {
    return db.transaction((tx) => PositionItemRepository.update(tx, id, data))
  },*/
  update: async (id: string, data: UpdatePositionItemDTO, userId?: string) => {
    return db.transaction((tx) =>
      PositionItemRepository.update(tx, id, data, userId),
    )
  },

  unassignedEmployee: async (positionItemId: string) => {
    await db.transaction((tx) =>
      PositionItemRepository.updateStatus(tx, positionItemId, 'open'),
    )

    return { message: 'Employee unassigned successfully' }
  },

  delete: async (id: string, userId?: string) => {
    return db.transaction(async (tx) => {
      const existing = await PositionItemRepository.softDelete(tx, id, userId)
      return existing
    })
  },
}
