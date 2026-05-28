export interface Department {
  id: string
  code: string
  nameEn: string
  nameAr: string
  parentDepartmentId?: string | null
  createdAt: string
}
