import { prisma } from './prisma';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'QUICK_SWITCH_LOGIN'
  | 'CREATE_EMPLOYEE'
  | 'UPDATE_EMPLOYEE'
  | 'ARCHIVE_EMPLOYEE'
  | 'DELETE_EMPLOYEE'
  | 'ROLE_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'SETTINGS_UPDATE'
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD'
  | 'SYSTEM_INIT';

export interface AuditLogParams {
  userId?: string | null;
  userEmail: string;
  action: AuditAction | string;
  module: string;
  recordId?: string | null;
  details?: string | Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function logAudit({
  userId,
  userEmail,
  action,
  module,
  recordId,
  details,
  ipAddress = '127.0.0.1',
}: AuditLogParams) {
  try {
    const detailsString =
      typeof details === 'object' && details !== null
        ? JSON.stringify(details)
        : (details as string) || null;

    await prisma.auditLog.create({
      data: {
        userId: userId || undefined,
        userEmail,
        action,
        module,
        recordId: recordId || undefined,
        details: detailsString,
        ipAddress: ipAddress || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

