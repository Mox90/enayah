import { InferInsertModel } from 'drizzle-orm'
import { db, employments } from '../../../../db'
import { toPositionItemResponse } from '../dto/positionItem.mapper'
import {
  PositionItemRepository,
  type PositionItemMutationContext,
} from '../repository/positionItem.repository'
import {
  CreatePositionItemDTO,
  JobPositionItemQueryDTO,
  PositionItemLookupQueryDTO,
  UpdatePositionItemDTO,
} from '../dto/positionItem.request'
import { getTodayInRiyadh } from '../../offboarding/utils/offboarding-date.util'

type EmploymentInsert = InferInsertModel<typeof employments>

export const PositionItemService = {
  assignEmployee: async (
    positionItemId: string,
    employeeId: string,
    userId?: string,
  ) => {
    const today = getTodayInRiyadh() //new Date().toISOString().split('T')[0]!

    return db.transaction(async (tx) => {
      // 🔥 1. atomic check + update
      const item = await PositionItemRepository.assignIfAvailable(
        tx,
        positionItemId,
        {
          effectiveDate: today,
          recordedBy: userId ?? null,
          changeReason: 'Position item assigned to employee',
        },
      )

      // 🔥 2. insert employment
      await tx.insert(employments).values({
        employeeId,
        hireDate: today,
        startDate: today,
      })

      return { message: 'Employee assigned successfully', positionItem: item }
    })
  },

  create: async (data: CreatePositionItemDTO, userId?: string) => {
    return db.transaction((tx) =>
      PositionItemRepository.create(tx, data, userId),
    )
  },

  findAll: async () => {
    return db.transaction((tx) => PositionItemRepository.findAll(tx))
  },

  findById: async (id: string) => {
    return db.transaction((tx) => PositionItemRepository.findById(tx, id))
  },

  findPaginated: async (query: JobPositionItemQueryDTO) => {
    const result = await PositionItemRepository.findPaginated(query)
    return {
      data: result.data.map(toPositionItemResponse),
      meta: result.meta,
    }
  },

  lookup: async (params: PositionItemLookupQueryDTO) => {
    return PositionItemRepository.findLookup(params)
  },

  // update: async (id: string, data: UpdatePositionItemDTO, userId?: string) => {
  //   return db.transaction((tx) =>
  //     PositionItemRepository.update(tx, id, data, userId),
  //   )
  // },
  update: async (id: string, data: UpdatePositionItemDTO, userId?: string) => {
    return db.transaction((tx) =>
      PositionItemRepository.update(tx, id, data, {
        effectiveDate: getTodayInRiyadh(),
        recordedBy: userId ?? null,
        changeReason: 'Position item details updated',
      }),
    )
  },

  // unassignedEmployee: async (positionItemId: string, userId?: string) => {
  //   await db.transaction((tx) =>
  //     PositionItemRepository.updateStatus(tx, positionItemId, 'vacant', {
  //       effectiveDate: getTodayInRiyadh(),
  //       recordedBy: userId ?? null,
  //       changeReason: 'Position item made vacant',
  //     }),
  //   )

  //   return {
  //     message: 'Position item marked vacant successfully',
  //   }
  // },

  // delete: async (id: string, userId?: string) => {
  //   return db.transaction(async (tx) => {
  //     const existing = await PositionItemRepository.softDelete(tx, id, userId)
  //     return existing
  //   })
  // },
  delete: async (id: string, userId?: string) => {
    return db.transaction((tx) =>
      PositionItemRepository.softDelete(tx, id, {
        effectiveDate: getTodayInRiyadh(),
        recordedBy: userId ?? null,
        changeReason: 'Position item deleted',
      }),
    )
  },
}
