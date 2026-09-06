import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGOUT',
        module: 'AUTH',
        recordId: user.id,
        details: `User ${user.email} logged out from the system.`,
      });
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
  } catch (error) {
    console.error('Logout error:', error);
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url, { status: 303 });
  }
}
