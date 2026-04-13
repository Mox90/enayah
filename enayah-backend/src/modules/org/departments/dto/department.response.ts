export interface DepartmentResponseDTO {
  id: string
  code: string
  nameEn: string
  nameAr: string
  logo?: string
  parentDepartmentId?: string | null
  createdAt: Date
}
