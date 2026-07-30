// enayah-frontend/src/modules/hr/employees/hooks/employee-query-keys.ts

export const employeeQueryKeys = {
  all: ['employees'] as const,

  lists: () => [...employeeQueryKeys.all, 'list'] as const,

  profile: (id: string) => [...employeeQueryKeys.all, 'profile', id] as const,

  profileSummary: (id: string) =>
    [...employeeQueryKeys.all, 'profile-summary', id] as const,
}
