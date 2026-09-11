// enayah-frontend/src/modules/hr/positions-items/types/position.item.types.ts

export type PositionItemStatus = 'vacant' | 'reserved' | 'filled' | 'frozen'

export type PositionItemWorkforceCategory =
  | 'physician'
  | 'nurse'
  | 'allied_health'
  | 'administrative'
  | 'support_service'

export interface PositionItem {
  id: string

  itemNumber: string

  departmentId: string

  departmentNameEn: string | null
  departmentNameAr: string | null

  positionId: string

  positionTitleEn: string | null
  positionTitleAr: string | null

  jobGradeId?: string | null

  workforceCategory: PositionItemWorkforceCategory | null

  categoryCode: number | null

  status: PositionItemStatus

  minSalary?: string | null
  maxSalary?: string | null

  createdAt?: string
  updatedAt?: string
}

export interface PaginatedPositionItems {
  data: PositionItem[]

  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
