import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role } from '@prisma/client';
import {
  ERPModule,
  PermissionCode,
  hasModuleAccess,
  hasPermission,
  ROLE_DISPLAY_NAMES,
  ROLE_DEFAULT_PERMISSIONS,
} from './permissions';

export { type ERPModule, type PermissionCode, hasModuleAccess, hasPermission, ROLE_DISPLAY_NAMES } from './permissions';

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
        employee: {
          include: {
            departmentDef: true,
            roleDef: true,
          },
        },
        roleDef: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (user && user.status === 'ACTIVE') {
      let userCustomPermissions: string[] = [];
      try {
        userCustomPermissions = JSON.parse(user.permissions || '[]');
      } catch {
        userCustomPermissions = [];
      }

      const dbRolePermissions = user.roleDef?.permissions?.map((rp) => rp.permission.code) || [];
      const defaultRolePerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
      const allPermissions = Array.from(new Set([...dbRolePermissions, ...defaultRolePerms, ...userCustomPermissions]));

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        roleDisplayName: user.roleDef?.displayName || ROLE_DISPLAY_NAMES[user.role] || user.role,
        status: user.status,
        permissions: allPermissions,
        employeeId: user.employee?.id,
        fullName: user.employee?.fullName || user.username,
        fatherHusbandName: user.employee?.fatherHusbandName || '',
        cnic: user.employee?.cnic || '',
        department: user.employee?.departmentDef?.name || user.employee?.department || 'Administration',
        departmentCode: user.employee?.departmentDef?.code || 'ADM',
        phoneNumber: user.employee?.phoneNumber,
        emergencyContact: user.employee?.emergencyContact,
        joiningDate: user.employee?.joiningDate,
      };
    }
  } catch {
    return null;
  }
}


export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireModuleAccess(module: ERPModule) {
  const user = await requireAuth();
  if (!hasModuleAccess(user.role, module, user.permissions)) {
    redirect('/dashboard?unauthorized=1');
  }
  return user;
}

export async function requirePermission(permissionCode: PermissionCode) {
  const user = await requireAuth();
  if (!hasPermission(user.role, permissionCode, user.permissions)) {
    throw new Error('FORBIDDEN_PERMISSION');
  }
  return user;
}

