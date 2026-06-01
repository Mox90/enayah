import { getEmployeeFullName } from '../../../../core/utils/name.utils'
import {
  CreatePositionItemDTO,
  UpdatePositionItemDTO,
} from './positionItem.request'
import {
  DepartmentHierarchyResponse,
  PositionItemHierarchy,
} from './positionItem.response'

export const toPositionItemDB = (dto: CreatePositionItemDTO) => ({
  /*itemNumber: dto.itemNumber,
  departmentId: dto.departmentId,
  positionId: dto.positionId,
  jobGradeId: dto.jobGradeId,
  categoryCode: dto.categoryCode,
  minSalary: dto.minSalary,
  maxSalary: dto.maxSalary,*/
  ...dto,
  minSalary: dto.minSalary !== undefined ? dto.minSalary.toString() : undefined,
  maxSalary: dto.maxSalary !== undefined ? dto.maxSalary.toString() : undefined,
  status: 'vacant' as const,
})

export const toPositionItemUpdateDB = (dto: UpdatePositionItemDTO) => ({
  ...(dto.itemNumber !== undefined && { itemNumber: dto.itemNumber }),
  ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
  ...(dto.positionId !== undefined && { positionId: dto.positionId }),
  ...(dto.jobGradeId !== undefined && { jobGradeId: dto.jobGradeId }),
  ...(dto.categoryCode !== undefined && { categoryCode: dto.categoryCode }),
  ...(dto.minSalary !== undefined && { minSalary: dto.minSalary.toString() }),
  ...(dto.maxSalary !== undefined && { maxSalary: dto.maxSalary.toString() }),
  //...(dto.status !== undefined && { status: dto.status }),
})

export const toPositionItemResponse = (dbRecord: any) => ({
  id: dbRecord.id,
  itemNumber: dbRecord.itemNumber,
  departmentId: dbRecord.departmentId,
  departmentNameEn: dbRecord.departmentNameEn ?? dbRecord.department?.nameEn,
  departmentNameAr: dbRecord.departmentNameAr ?? dbRecord.department?.nameAr,
  // department: dbRecord.departmentId
  //   ? {
  //       id: dbRecord.department.id,
  //       nameEn: dbRecord.department.nameEn,
  //       nameAr: dbRecord.department.nameAr,
  //     }
  //   : null,
  positionId: dbRecord.positionId,
  // position: dbRecord.positionId
  //   ? {
  //       id: dbRecord.position.id,
  //       titleEn: dbRecord.position.titleEn,
  //       titleAr: dbRecord.position.titleAr,
  //     }
  //   : null,
  positionTitleEn: dbRecord.positionTitleEn ?? dbRecord.position?.titleEn,
  positionTitleAr: dbRecord.positionTitleAr ?? dbRecord.position?.titleAr,
  jobGrade: dbRecord.jobGrade
    ? {
        id: dbRecord.jobGrade.id,
        name: dbRecord.jobGrade.name,
      }
    : null,
  categoryCode: dbRecord.categoryCode ?? undefined,
  workforceCategory: dbRecord.workforceCategory,
  minSalary: dbRecord.minSalary,
  maxSalary: dbRecord.maxSalary,
  status: dbRecord.status,
})

export function toHierarchyResponse(items: PositionItemHierarchy[]) {
  return items.map((item) => ({
    id: item.id,
    itemNumber: item.itemNumber,
    status: item.status,
    department: {
      id: item.department.id,
      nameEn: item.department.nameEn,
      nameAr: item.department.nameAr,
    },
    position: {
      id: item.position.id,
      titleEn: item.position.titleEn,
      titleAr: item.position.titleAr,
    },
    employee: item.employments[0]?.employee ?? null,
  }))
}

export function toDepartmentHierarchyResponse(
  items: PositionItemHierarchy[],
): DepartmentHierarchyResponse[] {
  const grouped = new Map<string, DepartmentHierarchyResponse>()

  for (const item of items) {
    const departmentId = item.department.id

    if (!grouped.has(departmentId)) {
      grouped.set(departmentId, {
        departmentId,
        departmentNameEn: item.department.nameEn,
        departmentNameAr: item.department.nameAr,
        totalItems: 0,
        filledItems: 0,
        vacantItems: 0,
        reservedItems: 0,
        items: [],
      })
    }

    const department = grouped.get(departmentId)!
    department.totalItems++

    if (item.status === 'filled') {
      department.filledItems++
    }

    if (item.status === 'vacant') {
      department.vacantItems++
    }

    if (item.status === 'reserved') {
      department.reservedItems++
    }

    const employee = item.employments[0]?.employee

    department.items.push({
      id: item.id,
      itemNumber: item.itemNumber,
      positionTitleEn: item.position.titleEn,
      positionTitleAr: item.position.titleAr,
      status: item.status,
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

  return Array.from(grouped.values())
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

interface DepartmentNode {
  id: string
  nameEn: string
  nameAr: string
  parentDepartmentId: string | null
  items: OrganizationHierarchyItem[]
  children: DepartmentNode[]
}

export function toOrganizationHierarchyResponse(
  items: PositionItemHierarchy[],
): OrganizationHierarchyResponse[] {
  const departmentMap = new Map<string, DepartmentNode>()

  for (const item of items) {
    const department = item.department

    if (!departmentMap.has(department.id)) {
      departmentMap.set(department.id, {
        id: department.id,
        nameEn: department.nameEn,
        nameAr: department.nameAr,
        parentDepartmentId: department.parentDepartmentId,
        items: [],
        children: [],
      })
    }

    const departmentNode = departmentMap.get(department.id)!

    const employee = item.employments[0]?.employee

    departmentNode.items.push({
      id: item.id,
      itemNumber: item.itemNumber,
      positionTitleEn: item.position.titleEn,
      positionTitleAr: item.position.titleAr,
      status: item.status,
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

  const roots: DepartmentNode[] = []

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

  const stripInternalFields = (
    node: DepartmentNode,
  ): OrganizationHierarchyResponse => ({
    id: node.id,
    nameEn: node.nameEn,
    nameAr: node.nameAr,
    items: node.items,
    children: node.children.map(stripInternalFields),
  })

  return roots.map(stripInternalFields)
}
