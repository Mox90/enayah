export interface PositionItem2 {
  id: string
  itemNumber: string
  departmentId: string
  department: {
    id: string
    nameEn: string
    nameAr: string
  }
  positionId: string
  position: {
    id: string
    titleEn: string
    titleAr: string
  }
  jobGradeId?: string
  workforceCategory: string
  categoryCode: string
  status: string
  minSalary?: string
  maxSalary?: string
}

export interface PositionItem {
  id: string
  itemNumber: string
  departmentId: string
  departmentNameEn: string
  departmentNameAr: string
  positionId: string
  positionTitleEn: string
  positionTitleAr?: string
  categoryCode: number
  workforceCategory: string
  status: string
  minSalary?: string
  maxSalary?: string
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
