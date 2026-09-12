import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

async function performLogout(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user) {
      try {
        await logAudit({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGOUT',
          module: 'AUTH',
          recordId: user.id,
          details: `User ${user.email} logged out from the system.`,
        });
      } catch (err) {
        console.warn('Could not write logout audit log:', err);
      }
    }
  } catch (err) {
    console.warn('Error during logout:', err);
  }

  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url, { status: 303 });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function POST(request: Request) {
  return performLogout(request);
}

export async function GET(request: Request) {
  return performLogout(request);
}

