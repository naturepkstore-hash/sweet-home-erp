import { prisma } from './prisma';

export interface AuditLogParams {
  userId?: string | null;
  userEmail: string;
  action: string;
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
