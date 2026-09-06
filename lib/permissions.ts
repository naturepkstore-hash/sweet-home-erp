import { Role } from '@prisma/client';

export type ERPModule =
  | 'dashboard'
  | 'children'
  | 'staff'
  | 'attendance'
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

export function hasModuleAccess(role: Role, module: ERPModule): boolean {
  if (role === Role.INCHARGE) {
    return true; // Full ERP access
  }

  if (role === Role.ACCOUNT_ASSISTANT) {
    // Full operational ERP access
    return [
      'dashboard',
      'children',
      'staff',
      'attendance',
      'hostel',
      'education',
      'inventory',
      'mess',
      'medical',
      'finance',
      'purchases',
      'expenses',
      'reports',
    ].includes(module);
  }

  if (role === Role.HR_REPRESENTATIVE) {
    return ['dashboard', 'staff', 'attendance', 'reports'].includes(module);
  }

  if (role === Role.CLERK) {
    return ['dashboard', 'children', 'attendance', 'hostel', 'education', 'reports'].includes(module);
  }

  if (role === Role.MOTHER_MAID) {
    return ['dashboard', 'children', 'attendance'].includes(module);
  }

  if (role === Role.WAITER) {
    return ['dashboard', 'mess', 'attendance'].includes(module);
  }

  if (role === Role.COOK) {
    return ['dashboard', 'mess', 'inventory', 'attendance'].includes(module);
  }

  if (role === Role.COOK_HELPER) {
    return ['dashboard', 'mess', 'attendance'].includes(module);
  }

  if (role === Role.SWEEPER) {
    return ['dashboard', 'attendance'].includes(module);
  }

  if (role === Role.SECURITY_GUARD) {
    return ['dashboard', 'attendance'].includes(module);
  }

  return false;
}
