export interface DepartmentResponseDTO {
  id: string
  code: string
  nameEn: string
  nameAr: string
  logo?: string
  parentDepartmentId?: string | null
  createdAt: Date
}

export interface DepartmentTreeItemResponse {
  id: string
  itemNumber: string
  status: string
  positionTitleEn: string
  positionTitleAr: string | null
  employee: {
    id: string
    employeeNumber: string
    fullNameEn: string
    fullNameAr: string
  } | null
}

export interface DepartmentTreeResponse {
  id: string
  code: string
  nameEn: string
  nameAr: string
  items: DepartmentTreeItemResponse[]
  children: DepartmentTreeResponse[]
}

export interface DepartmentHierarchyEmployeeResponse {
  id: string
  employeeNumber: string
  fullNameEn: string
  fullNameAr: string
}

export interface DepartmentHierarchyItemResponse {
  id: string
  itemNumber: string
  status: string
  positionTitleEn: string
  positionTitleAr: string | null
  employee: DepartmentHierarchyEmployeeResponse | null
}

export interface DepartmentHierarchyResponse {
  id: string
  code: string
  nameEn: string
  nameAr: string
  items: DepartmentHierarchyItemResponse[]
  children: DepartmentHierarchyResponse[]
}
