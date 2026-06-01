export interface PositionItemResponse {
  id: string
  itemNumber: string
  departmentId: string
  positionId: string
  jobGrade?: {
    id: string
    name: string
  } | null
  categoryCode?: number
  minSalary?: number
  maxSalary?: number
  //status: string
}

export interface PositionItemHierarchy {
  id: string
  itemNumber: string
  status: string
  department: {
    id: string
    nameEn: string
    nameAr: string
    parentDepartmentId: string | null
  }
  position: {
    id: string
    titleEn: string
    titleAr: string | null
  }
  employments: {
    id: string
    employee: {
      id: string
      employeeNumber: string

      firstNameEn: string
      secondNameEn?: string | null
      thirdNameEn?: string | null
      familyNameEn: string

      firstNameAr: string
      secondNameAr?: string | null
      thirdNameAr?: string | null
      familyNameAr: string
    }
  }[]
}

export interface DepartmentHierarchy {
  departmentId: string
  departmentNameEn: string
  departmentNameAr: string

  items: {
    id: string
    itemNumber: string

    positionTitleEn: string
    positionTitleAr: string | null

    status: string
    employeeNameEn?: string
    employeeNameAr?: string
  }[]
}

export interface HierarchyItemResponse {
  id: string

  itemNumber: string

  positionTitleEn: string
  positionTitleAr: string | null

  status: string

  employee: {
    id: string
    employeeNumber: string

    fullNameEn: string
    fullNameAr: string
  } | null
}

export interface DepartmentHierarchyResponse {
  departmentId: string

  departmentNameEn: string
  departmentNameAr: string

  totalItems: number
  filledItems: number
  vacantItems: number
  reservedItems: number

  items: HierarchyItemResponse[]
}

export interface OrganizationalHierarchy {
  id: string
  itemNumber: string
  status: string

  department: {
    id: string
    nameEn: string
    nameAr: string
    parentDepartmentId: string | null
  }

  position: {
    id: string
    titleEn: string
    titleAr: string | null
  }

  employments: {
    employee: {
      id: string
      employeeNumber: string

      firstNameEn: string
      secondNameEn?: string | null
      thirdNameEn?: string | null
      familyNameEn: string

      firstNameAr: string
      secondNameAr?: string | null
      thirdNameAr?: string | null
      familyNameAr: string
    }
  }[]
}

export interface OrganizationHierarchyResponse {
  id: string

  nameEn: string
  nameAr: string

  items: OrganizationHierarchyItem[]

  children: OrganizationHierarchyResponse[]
}

export interface OrganizationHierarchyItem {
  id: string

  itemNumber: string

  positionTitleEn: string
  positionTitleAr: string | null

  status: string

  employee: {
    id: string
    employeeNumber: string

    fullNameEn: string
    fullNameAr: string
  } | null
}
