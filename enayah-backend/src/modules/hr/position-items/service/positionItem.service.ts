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

  create: async (data: any) => {
    /*const [positionItem] = await await PositionItemRepository.create(
      toPositionItemDB(data),
    )*/
    //return toPositionItemResponse(positionItem)
    return PositionItemRepository.create(data)
  },

  findAll: async () => {
    //const positionItems = await PositionItemRepository.findAll()
    //return positionItems.map(toPositionItemResponse)
    return PositionItemRepository.findAll()
  },

  findById: async (id: string) => {
    /*const positionItem = await PositionItemRepository.findById(id)
    if (!positionItem) throw new AppError('PositionItem not found', 404)
    return positionItem*/
    return PositionItemRepository.findById(id)
  },

  update: async (id: string, data: any) => {
    /*const positionItem = await PositionItemRepository.findById(id)
    if (!positionItem) throw new AppError('PositionItem not found', 404)
    const [updatedPositionItem] = await PositionItemRepository.update(
      id,
      toPositionItemDB(data),
    )
    return toPositionItemResponse(updatedPositionItem)*/
    return EmployeeRepository.update(id, data)
  },

  unassignedEmployee: async (positionItemId: string) => {
    await PositionItemRepository.updateStatus(positionItemId, 'open')

    return { message: 'Employee unassigned successfully' }
  },
}
