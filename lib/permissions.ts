import { Role } from '@prisma/client';

export type ERPModule =
  | 'dashboard'
  | 'children'
  | 'staff'
  | 'leave'
  | 'payroll'
  | 'attendance'
  | 'duties'
  | 'hostel'
  | 'education'
  | 'inventory'
  | 'mess'
  | 'medical'
  | 'finance'
  | 'purchases'
  | 'expenses'
  | 'reports'
  | 'audit'
  | 'settings';

export type PermissionCode =
  | 'dashboard.view'
  | 'employees.view'
  | 'employees.create'
  | 'employees.update'
  | 'employees.delete'
  | 'employees.manage_users'
  | 'employees.manage_roles'
  | 'children.view'
  | 'children.create'
  | 'children.update'
  | 'children.delete'
  | 'attendance.view'
  | 'attendance.create'
  | 'attendance.update'
  | 'duties.view'
  | 'duties.assign'
  | 'duties.update'
  | 'duties.complete'
  | 'duties.archive'
  | 'duties.report'
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.update'
  | 'inventory.stock_in'
  | 'inventory.stock_out'
  | 'ration.view'
  | 'ration.create'
  | 'ration.update'
  | 'kitchen.view'
  | 'kitchen.create'
  | 'kitchen.update'
  | 'finance.view'
  | 'finance.create'
  | 'finance.update'
  | 'reports.view'
  | 'reports.export'
  | 'audit_logs.view'
  | 'settings.view'
  | 'settings.manage';

/**
 * Standard Role Display Names for consistent UI representation
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  INCHARGE: 'Incharge (Highest Authority)',
  ACCOUNT_ASSISTANT: 'Account Assistant',
  HR_REPRESENTATIVE: 'HR Representative',
  CLERK: 'Records Clerk',
  MOTHER_MAID: 'Mother Maid',
  WAITER: 'Waiter / Dining Staff',
  COOK: 'Head Cook',
  COOK_HELPER: 'Cook Helper',
  SWEEPER: 'Sanitation Staff',
  SECURITY_GUARD: 'Security Guard',
  DRIVER: 'Driver',
  QARI_QARIA: 'Qari / Qaria',
};

/**
 * Default Granular Permissions assigned to each role
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<Role, PermissionCode[]> = {
  INCHARGE: [
    'dashboard.view',
    'employees.view',
    'employees.create',
    'employees.update',
    'employees.delete',
    'employees.manage_users',
    'employees.manage_roles',
    'children.view',
    'children.create',
    'children.update',
    'children.delete',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'duties.view',
    'duties.assign',
    'duties.update',
    'duties.complete',
    'duties.archive',
    'duties.report',
    'inventory.view',
    'inventory.create',
    'inventory.update',
    'inventory.stock_in',
    'inventory.stock_out',
    'ration.view',
    'ration.create',
    'ration.update',
    'kitchen.view',
    'kitchen.create',
    'kitchen.update',
    'finance.view',
    'finance.create',
    'finance.update',
    'reports.view',
    'reports.export',
    'audit_logs.view',
    'settings.view',
    'settings.manage',
  ],
  ACCOUNT_ASSISTANT: [
    'dashboard.view',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'inventory.view',
    'inventory.create',
    'inventory.update',
    'inventory.stock_in',
    'inventory.stock_out',
    'ration.view',
    'ration.create',
    'ration.update',
    'kitchen.view',
    'kitchen.create',
    'kitchen.update',
    'finance.view',
    'finance.create',
    'finance.update',
    'reports.view',
    'reports.export',
  ],
  HR_REPRESENTATIVE: [
    'dashboard.view',
    'employees.view',
    'employees.create',
    'employees.update',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'duties.view',
    'duties.assign',
    'duties.update',
    'duties.archive',
    'duties.report',
    'reports.view',
  ],
  CLERK: [
    'dashboard.view',
    'children.view',
    'children.create',
    'children.update',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
    'reports.view',
  ],
  MOTHER_MAID: [
    'dashboard.view',
    'children.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  WAITER: [
    'dashboard.view',
    'kitchen.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  COOK: [
    'dashboard.view',
    'kitchen.view',
    'kitchen.create',
    'kitchen.update',
    'inventory.view',
    'ration.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  COOK_HELPER: [
    'dashboard.view',
    'kitchen.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  SWEEPER: [
    'dashboard.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  SECURITY_GUARD: [
    'dashboard.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  DRIVER: [
    'dashboard.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
  QARI_QARIA: [
    'dashboard.view',
    'attendance.view',
    'attendance.create',
    'duties.view',
    'duties.complete',
  ],
};

/**
 * Check if a role or custom user permissions grant access to a module
 */
export function hasModuleAccess(role: Role, module: ERPModule, customPermissions: string[] = []): boolean {
  if (role === Role.INCHARGE) {
    return true; // Incharge has total access
  }

  if (role === Role.ACCOUNT_ASSISTANT) {
    return [
      'dashboard',
      'attendance',
      'inventory',
      'mess',
      'finance',
      'purchases',
      'expenses',
      'leave',
      'payroll',
      'reports',
    ].includes(module);
  }

  if (role === Role.HR_REPRESENTATIVE) {
    return ['dashboard', 'staff', 'leave', 'attendance', 'duties', 'reports'].includes(module);
  }

  if (role === Role.CLERK) {
    return ['dashboard', 'children', 'leave', 'attendance', 'hostel', 'education', 'reports'].includes(module);
  }

  if (role === Role.MOTHER_MAID) {
    return ['dashboard', 'children', 'leave', 'attendance'].includes(module);
  }

  if (role === Role.WAITER) {
    return ['dashboard', 'mess', 'leave', 'attendance'].includes(module);
  }

  if (role === Role.COOK) {
    return ['dashboard', 'mess', 'inventory', 'leave', 'attendance'].includes(module);
  }

  if (role === Role.COOK_HELPER) {
    return ['dashboard', 'mess', 'leave', 'attendance'].includes(module);
  }

  if (role === Role.SWEEPER) {
    return ['dashboard', 'leave', 'attendance'].includes(module);
  }

  if (role === Role.SECURITY_GUARD) {
    return ['dashboard', 'leave', 'attendance', 'duties'].includes(module);
  }

  if (role === Role.DRIVER || role === Role.QARI_QARIA) {
    return ['dashboard', 'leave', 'attendance'].includes(module);
  }

  return false;
}

/**
 * Check if a user possesses a specific fine-grained permission code
 */
export function hasPermission(
  role: Role,
  permissionCode: PermissionCode,
  customPermissions: string[] = []
): boolean {
  if (role === Role.INCHARGE) return true;

  if (customPermissions.includes(permissionCode)) return true;

  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[role] || [];
  return defaultPerms.includes(permissionCode);
}

/**
 * Incharge Protection Policy:
 * Account Assistant or HR cannot:
 * - Modify Incharge record or change Incharge's role
 * - Promote any staff member to Incharge
 * - Disable, suspend, or delete Incharge
 */
export function canManageStaffRole(
  actorRole: Role,
  targetCurrentRole: Role,
  targetNewRole?: Role
): { allowed: boolean; reason?: string } {
  if (actorRole === Role.INCHARGE) {
    return { allowed: true };
  }

  if (targetCurrentRole === Role.INCHARGE) {
    return {
      allowed: false,
      reason: 'Only the Incharge can modify or manage the Incharge account.',
    };
  }

  if (targetNewRole === Role.INCHARGE) {
    return {
      allowed: false,
      reason: 'Only the Incharge can delegate or assign Incharge-level authority.',
    };
  }

  return { allowed: true };
}

