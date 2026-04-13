export interface CreateDepartmentDto {
  name: string
  nameAr?: string
  description?: string
  parentDepartmentId?: number
}

export interface UpdateDepartmentDto {
  name?: string
  nameAr?: string
  description?: string
  parentDepartmentId?: number
}

export interface Department {
  id: number
  name: string
  nameAr?: string
  description?: string
  parentDepartmentId?: number
  createdAt: Date
  updatedAt: Date
}
