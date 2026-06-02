import { getEmployeeFullName } from '../../../../core/utils/name.utils'
import { CreateDepartmentDTO, UpdateDepartmentDTO } from './department.request'
import {
  DepartmentTreeItemResponse,
  DepartmentTreeResponse,
} from './department.response'

export const toDepartmentDB = (dto: CreateDepartmentDTO) => ({
  code: dto.code,
  nameEn: dto.nameEn,
  nameAr: dto.nameAr,
  logo: dto.logo,
  parentDepartmentId: dto.parentDepartmentId,
})

export const toDepartmentUpdateDB = (dto: UpdateDepartmentDTO) => ({
  ...(dto.code && { code: dto.code }),
  ...(dto.nameEn && { nameEn: dto.nameEn }),
  ...(dto.nameAr && { nameAr: dto.nameAr }),
  ...(dto.logo && { logo: dto.logo }),
  ...(dto.parentDepartmentId && { parentDepartmentId: dto.parentDepartmentId }),
})

export const toDepartmentResponse = (db: any) => ({
  id: db.id,
  code: db.code,
  nameEn: db.nameEn,
  nameAr: db.nameAr,
  logo: db.logo,
  parentDepartmentId: db.parentDepartmentId,
  createdAt: db.createdAt,
})

export const toDepartmentLookupResponse = (db: any) => ({
  id: db.id,
  nameEn: db.nameEn,
  nameAr: db.nameAr,
})

interface DepartmentTreeNode {
  id: string
  code: string
  nameEn: string
  nameAr: string
  parentDepartmentId: string | null
  items: DepartmentTreeItemResponse[]
  children: DepartmentTreeNode[]
}

export function toDepartmentTreeResponse(
  departments: any[],
): DepartmentTreeResponse[] {
  const departmentMap = new Map<string, DepartmentTreeNode>()

  // STEP 1: Create department nodes
  for (const department of departments) {
    departmentMap.set(department.id, {
      id: department.id,
      code: department.code,
      nameEn: department.nameEn,
      nameAr: department.nameAr,
      parentDepartmentId: department.parentDepartmentId,
      items: [],
      children: [],
    })
  }

  // STEP 2: Populate PCNs / Employees
  for (const department of departments) {
    const node = departmentMap.get(department.id)!

    for (const item of department.positionItems ?? []) {
      const activeEmployment = item.employments?.[0]
      const employee = activeEmployment?.employee

      node.items.push({
        id: item.id,
        itemNumber: item.itemNumber,
        status: item.status,
        positionTitleEn: item.position?.titleEn ?? '',
        positionTitleAr: item.position?.titleAr ?? null,
        employee: employee
          ? {
              id: employee.id,
              employeeNumber: employee.employeeNumber,
              fullNameEn: getEmployeeFullName(employee, 'en'),
              fullNameAr: getEmployeeFullName(employee, 'ar'),
            }
          : null,
      })
    }

    // Optional PCN sorting
    node.items.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber))
  }

  // STEP 3: Build hierarchy
  const roots: DepartmentTreeNode[] = []
  for (const department of departmentMap.values()) {
    if (!department.parentDepartmentId) {
      roots.push(department)
      continue
    }

    const parent = departmentMap.get(department.parentDepartmentId)
    if (parent) {
      parent.children.push(department)
    } else {
      roots.push(department)
    }
  }

  // STEP 4: Recursive sorting
  const sortTree = (nodes: DepartmentTreeNode[]) => {
    nodes.sort((a, b) => a.nameEn.localeCompare(b.nameEn))

    for (const node of nodes) {
      sortTree(node.children)
    }
  }

  sortTree(roots)
  // STEP 5: Remove internal field
  const stripInternalFields = (
    node: DepartmentTreeNode,
  ): DepartmentTreeResponse => ({
    id: node.id,
    code: node.code,
    nameEn: node.nameEn,
    nameAr: node.nameAr,
    items: node.items,
    children: node.children.map(stripInternalFields),
  })

  return roots.map(stripInternalFields)
}
