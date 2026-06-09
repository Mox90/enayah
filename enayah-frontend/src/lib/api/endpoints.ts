// src/lib/api/endpoints.ts

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
  },

  iam: {
    login: '/iam/auth/login',
    signup: 'iam/auth/signup',
    me: '/iam/auth/me',
    logout: '/iam/auth/logout',
  },
}
