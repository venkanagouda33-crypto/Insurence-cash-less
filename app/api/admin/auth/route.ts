import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminCookieName, checkCredentials, createAdminSession, isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
const loginSchema = z.object({ id: z.string().trim().min(1).max(100), password: z.string().min(1).max(200) });

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(req) });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success || !checkCredentials(parsed.data.id, parsed.data.password)) {
    return NextResponse.json({ error: 'Admin ID or password is incorrect.' }, { status: 401 });
  }
  const session = createAdminSession();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookieName, session.value, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: session.maxAge });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, '', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
