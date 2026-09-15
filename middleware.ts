import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@prisma/client';

const SESSION_COOKIE_NAME = 'pbm_session';

// Define module routes and permitted roles mapping
const MODULE_ROLE_ACCESS: Record<string, Role[]> = {
  '/finance': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/expenses': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/purchases': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/inventory': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/ration': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/mess': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/kitchen': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/settings': [Role.INCHARGE],
  '/audit': [Role.INCHARGE],
  '/staff': [Role.INCHARGE, Role.HR_REPRESENTATIVE],
  '/employees': [Role.INCHARGE, Role.HR_REPRESENTATIVE],
  '/children': [Role.INCHARGE, Role.CLERK],
  '/hostel': [Role.INCHARGE, Role.CLERK],
  '/education': [Role.INCHARGE, Role.CLERK],
  '/medical': [Role.INCHARGE],
  '/reports': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.HR_REPRESENTATIVE, Role.CLERK],
  '/duties': [Role.INCHARGE, Role.HR_REPRESENTATIVE, Role.SECURITY_GUARD],
  '/attendance': [
    Role.INCHARGE,
    Role.ACCOUNT_ASSISTANT,
    Role.HR_REPRESENTATIVE,
    Role.CLERK,
    Role.MOTHER_MAID,
    Role.WAITER,
    Role.COOK,
    Role.COOK_HELPER,
    Role.SWEEPER,
    Role.SECURITY_GUARD,
    Role.DRIVER,
    Role.QARI_QARIA,
  ],
  '/dashboard': [
    Role.INCHARGE,
    Role.ACCOUNT_ASSISTANT,
    Role.HR_REPRESENTATIVE,
    Role.CLERK,
    Role.MOTHER_MAID,
    Role.WAITER,
    Role.COOK,
    Role.COOK_HELPER,
    Role.SWEEPER,
    Role.SECURITY_GUARD,
    Role.DRIVER,
    Role.QARI_QARIA,
  ],
  '/api/finance': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/api/expenses': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/api/purchases': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/api/inventory': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/api/mess': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT],
  '/api/hostel': [Role.INCHARGE, Role.CLERK],
  '/api/medical': [Role.INCHARGE],
  '/api/settings': [Role.INCHARGE],
  '/api/audit': [Role.INCHARGE],
  '/api/staff': [Role.INCHARGE, Role.HR_REPRESENTATIVE],
  '/api/children': [Role.INCHARGE, Role.CLERK],
  '/api/education': [Role.INCHARGE, Role.CLERK],
  '/api/attendance': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.HR_REPRESENTATIVE, Role.CLERK],
  '/api/duties': [Role.INCHARGE, Role.HR_REPRESENTATIVE, Role.SECURITY_GUARD],
  '/api/duty-assignments': [Role.INCHARGE, Role.HR_REPRESENTATIVE, Role.SECURITY_GUARD],
  '/api/duty-catalog': [Role.INCHARGE, Role.HR_REPRESENTATIVE, Role.SECURITY_GUARD],
  '/api/reports': [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.HR_REPRESENTATIVE, Role.CLERK],
};

function parseJwtPayload(token: string): { role?: Role; userId?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and API routes that handle authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/login-profiles') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isLoginPage = pathname === '/login';
  const hasForceLogout = request.nextUrl.searchParams.get('logout') === '1' || request.nextUrl.searchParams.get('force') === '1';

  if (isLoginPage && hasForceLogout) {
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 2. Unauthenticated user trying to access protected route -> Redirect to /login
  if (!sessionToken) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. User has a session token
  const payload = parseJwtPayload(sessionToken);
  if (!payload || !payload.role) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 4. Authenticated user visiting /login -> Redirect to /dashboard
  if (isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Root path / redirect to /dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  // 5. Role-based Route Protection Check
  const userRole = payload.role;
  for (const [routePrefix, allowedRoles] of Object.entries(MODULE_ROLE_ACCESS)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
      if (!allowedRoles.includes(userRole)) {
        // Forbidden direct URL navigation -> Redirect to dashboard with unauthorized notification
        const unauthorizedUrl = new URL('/dashboard?unauthorized=1', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, css, or other public files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
