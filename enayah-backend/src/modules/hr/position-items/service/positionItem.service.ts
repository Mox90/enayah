import { InferInsertModel } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { db, employments } from '../../../../db'
import {
  toPositionItemDB,
  toPositionItemResponse,
} from '../dto/positionItem.mapper'
import { PositionItemRepository } from '../repository/positionItem.repository'
import { validatePositionItemAssignment } from '../validators/positionItem.validator'

type EmploymentInsert = InferInsertModel<typeof employments>

export const PositionItemService = {
  create: async (data: any) => {
    const [positionItem] = await await PositionItemRepository.create(
      toPositionItemDB(data),
    )
    return toPositionItemResponse(positionItem)
  },

  findAll: async () => {
    const positionItems = await PositionItemRepository.findAll()
    return positionItems.map(toPositionItemResponse)
  },

  findById: async (id: string) => {
    const positionItem = await PositionItemRepository.findById(id)
    if (!positionItem) throw new AppError('PositionItem not found', 404)
    return toPositionItemResponse(positionItem)
  },

  update: async (id: string, data: any) => {
    const positionItem = await PositionItemRepository.findById(id)
    if (!positionItem) throw new AppError('PositionItem not found', 404)
    const [updatedPositionItem] = await PositionItemRepository.update(
      id,
      toPositionItemDB(data),
    )
    return toPositionItemResponse(updatedPositionItem)
  },

  assignEmployee: async (positionItemId: string, employeeId: string) => {
    await validatePositionItemAssignment(positionItemId)
    const today = new Date().toISOString().split('T')[0]!

    const data: EmploymentInsert = {
      employeeId,
      positionItemId,
      hireDate: today,
      startDate: today,
    }
    await db.insert(employments).values(data)
    await PositionItemRepository.updateStatus(positionItemId, 'filled')

    return { message: 'Employee assigned successfully' }
  },

  unassignedEmployee: async (positionItemId: string) => {
    await PositionItemRepository.updateStatus(positionItemId, 'open')

    return { message: 'Employee unassigned successfully' }
  },
}
