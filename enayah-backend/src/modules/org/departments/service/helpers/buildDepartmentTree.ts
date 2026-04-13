export const buildDepartmentTree = (
  departments: any[],
  parentId: string | null = null,
) => {
  const map = new Map<string, any>()
  const roots: any[] = []

  // First pass: create a map of id to department
  for (const dept of departments) {
    map.set(dept.id, {
      ...dept,
      children: [],
    })
  }

  // Second pass: build the tree
  for (const dept of departments) {
    //const node = map.get(dept.id)

    if (dept.parentDepartmentId) {
      const parent = map.get(dept.parentDepartmentId)
      if (parent) {
        parent.children.push(map.get(dept.id))
      }
    } else {
      roots.push(map.get(dept.id))
    }
  }

  return roots
}
