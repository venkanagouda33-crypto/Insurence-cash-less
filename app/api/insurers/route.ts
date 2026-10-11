import { NextResponse } from 'next/server';
import db from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json(db.prepare('SELECT id,name FROM insurers ORDER BY name').all())}
