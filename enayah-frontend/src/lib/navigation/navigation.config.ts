import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Database,
  FileText,
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
  PickaxeIcon,
  Waypoints,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: any
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
    label: 'positions',
    href: '/job-positions',
    icon: Waypoints,
    permission: 'position.view',
  },

  {
    label: 'departments',
    href: '/departments',
    icon: Building2,
    permission: 'department.view',
  },

  {
    label: 'hiring',
    href: '/hiring',
    icon: Briefcase,
    permission: 'employee.hire',
  },

  {
    label: 'contracts',
    href: '/contracts',
    icon: FileText,
    permission: 'contract.view',
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
