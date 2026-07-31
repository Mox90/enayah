import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Database,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Settings,
  Shield,
  Users,
  Wallet,
  CheckSquare,
  UserCheck,
  Waypoints,
  TrafficCone,
  FileClock,
  LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  permission?: string
}

export const navigation: NavigationItem[] = [
  {
    label: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  {
    label: 'employees',
    href: '/employees',
    icon: Users,
    permission: 'employee.view',
  },

  {
    label: 'departments',
    href: '/departments',
    icon: Building2,
    permission: 'department.view',
  },

  {
    label: 'positions',
    href: '/job-positions',
    icon: Waypoints,
    permission: 'position.view',
  },

  {
    label: 'positionItems',
    href: '/job-position-items',
    icon: TrafficCone,
    permission: 'position.items.view',
  },

  {
    label: 'hiring',
    href: '/hiring',
    icon: Briefcase,
    permission: 'employee.hire',
  },

  // {
  //   label: 'contracts',
  //   href: '/contracts',
  //   icon: FileText,
  //   permission: 'contract.view',
  // },

  {
    label: 'iqamaRenewal',
    href: '/iqama-renewal-process',
    icon: FileClock,
    permission: 'iqama.renewal.view',
  },

  {
    label: 'attendance',
    href: '/attendance',
    icon: Calendar,
    permission: 'attendance.view',
  },

  {
    label: 'payroll',
    href: '/payroll',
    icon: Wallet,
    permission: 'payroll.view',
  },

  {
    label: 'training',
    href: '/training',
    icon: GraduationCap,
    permission: 'training.view',
  },

  {
    label: 'performance',
    href: '/performance',
    icon: LineChart,
    permission: 'performance.view',
  },

  {
    label: 'documents',
    href: '/documents',
    icon: FolderOpen,
    permission: 'document.view',
  },

  {
    label: 'analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics.view',
  },

  {
    label: 'auditLogs',
    href: '/audit-logs',
    icon: ClipboardList,
    permission: 'audit.logs.view',
  },

  {
    label: 'systemMonitoring',
    href: '/system-monitoring',
    icon: Activity,
    permission: 'system.monitor',
  },

  {
    label: 'rolesPermissions',
    href: '/roles-permissions',
    icon: Shield,
    permission: 'role.manage',
  },

  {
    label: 'database',
    href: '/database',
    icon: Database,
    permission: 'database.manage',
  },

  {
    label: 'security',
    href: '/security',
    icon: Shield,
    permission: 'security.manage',
  },

  {
    label: 'tasks',
    href: '/tasks',
    icon: CheckSquare,
    permission: 'task.view',
  },

  {
    label: 'myProfile',
    href: '/my-profile',
    icon: UserCheck,
  },

  {
    label: 'settings',
    href: '/settings',
    icon: Settings,
  },
]
