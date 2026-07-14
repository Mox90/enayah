export const API_ENDPOINTS = {
  org: {
    departments: '/org/departments',
  },

  hr: {
    employees: '/hr/employees',
    employments: '/hr/employments',
    positionItems: '/hr/position-items',
    positions: '/hr/positions',
    credentials: '/hr/credentials',
    onboarding: '/hr/onboarding',
    contracts: '/hr/contracts',
    iqamaRenewal: '/hr/iqama-renewal-process',
  },

  iam: {
    login: '/iam/auth/login',
    signup: 'iam/auth/signup',
    me: '/iam/auth/me',
    logout: '/iam/auth/logout',
  },

  countries: {
    get: '/countries',
  },
}
