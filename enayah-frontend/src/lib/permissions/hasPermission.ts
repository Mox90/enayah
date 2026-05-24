export function hasPermission(permissions: string[], required: string) {
  //return required.every((permission) => permissions.includes(permission))
  return permissions.includes(required)
}
