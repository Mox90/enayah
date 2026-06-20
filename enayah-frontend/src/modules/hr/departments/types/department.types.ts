export interface Department {
  id: string
  code: string
  nameEn: string
  nameAr: string
  logo?: string | null
  parentDepartmentId?: string | null
  createdAt: string
}

export interface PaginatedDepartments {
  data: Department[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DepartmentListResponse {
  data: Department[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
