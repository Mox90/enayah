export interface HierarchyEmployee {
  id: string

  employeeNumber: string

  fullNameEn: string
  fullNameAr: string
}

export interface HierarchyItem {
  id: string

  itemNumber: string

  status: string

  positionTitleEn: string
  positionTitleAr: string | null

  employee: HierarchyEmployee | null
}

export interface DepartmentHierarchyNode {
  id: string

  code: string

  nameEn: string
  nameAr: string

  items: HierarchyItem[]

  children: DepartmentHierarchyNode[]
}
