import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role } from '@prisma/client';
import { ERPModule, hasModuleAccess } from './permissions';

export { type ERPModule, hasModuleAccess } from './permissions';

const JWT_SECRET = process.env.JWT_SECRET || 'pbm-sweet-home-multan-jwt-secret-key-2026';
export const SESSION_COOKIE_NAME = 'pbm_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  username: string;
  fullName: string;
  employeeId?: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  const payload = verifySessionToken(sessionToken);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        employee: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') return null;

    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(user.permissions || '[]');
    } catch {
      parsedPermissions = [];
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      permissions: parsedPermissions,
      employeeId: user.employee?.id,
      fullName: user.employee?.fullName || user.username,
      department: user.employee?.department || 'Administration',
      phoneNumber: user.employee?.phoneNumber,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireModuleAccess(module: ERPModule) {
  const user = await requireAuth();
  if (!hasModuleAccess(user.role, module)) {
    throw new Error('FORBIDDEN_MODULE_ACCESS');
  }
  return user;
}
