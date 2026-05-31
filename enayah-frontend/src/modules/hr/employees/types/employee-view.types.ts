export type EmployeeView =
  | 'list'
  | 'kanban'
  | 'tree'
  | 'hierarchy'
  | 'create'
  | 'profile'

export interface Employee {
  id: string

  employeeNumber: string

  firstNameEn: string
  secondNameEn?: string
  thirdNameEn?: string
  familyNameEn: string

  firstNameAr: string
  secondNameAr?: string
  thirdNameAr?: string
  familyNameAr: string

  gender?: string

  nationality?: {
    id: string
    nameEn: string
    nameAr: string
  }

  createdAt: string
  updatedAt: string
}
