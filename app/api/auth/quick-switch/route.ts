import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ error: 'Role switching is disabled.' }, { status: 403 });
}

