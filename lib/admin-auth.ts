import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'nc_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;

function signature(expires: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return createHmac('sha256', secret).update(expires).digest('hex');
}

export function checkCredentials(id: string, password: string) {
  const expectedId = process.env.ADMIN_ID;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedId || !expectedPassword) return false;
  return safeEqual(id, expectedId) && safeEqual(password, expectedPassword);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createAdminSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return { value: `${expires}.${signature(expires)}`, maxAge: SESSION_SECONDS };
}

export function isAdminRequest(req: NextRequest) {
  const value = req.cookies.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expires, supplied] = value.split('.');
  if (!expires || !supplied || !/^\d+$/.test(expires) || Number(expires) <= Date.now() / 1000) return false;
  try { return safeEqual(supplied, signature(expires)); } catch { return false; }
}

export const adminCookieName = COOKIE_NAME;
