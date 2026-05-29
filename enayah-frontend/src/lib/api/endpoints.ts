// src/lib/api/endpoints.ts

export const API_ENDPOINTS = {
  org: {
    departments: '/org/departments',
    positions: '/hr/positions',
  },

  hr: {
    employees: '/hr/employees',
    employments: '/hr/employments',
  },

  iam: {
    login: '/iam/auth/login',
    signup: 'iam/auth/signup',
    me: '/iam/auth/me',
    logout: '/iam/auth/logout',
  },
}
