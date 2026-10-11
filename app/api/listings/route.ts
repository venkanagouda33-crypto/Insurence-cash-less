import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { recordActivity } from '@/lib/activity';
export const dynamic='force-dynamic';
const querySchema=z.object({q:z.string().trim().max(100).default(''),insurer:z.string().trim().max(100).default(''),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(50).default(8)});
const base=` FROM hospital_network_listings l JOIN hospitals h ON h.id=l.hospital_id JOIN insurers i ON i.id=l.insurer_id `;
const where=` WHERE l.status IN ('active','inactive','pending_review') AND (?='' OR h.name LIKE ? OR h.city LIKE ? OR h.pin_code LIKE ?) AND (?='' OR i.name=?)`;
export async function GET(req:NextRequest){const parsed=querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));if(!parsed.success)return NextResponse.json({error:'Invalid search parameters'}, {status:400});recordActivity('search');const {q,insurer,page,limit}=parsed.data;const term=`%${q}%`,args=[q,term,term,term,insurer,insurer];const total=(db.prepare(`SELECT COUNT(*) as n${base}${where}`).get(...args) as {n:number}).n;const items=db.prepare(`SELECT l.id,l.hospital_id,h.name AS hospital_name,h.address,h.city,h.state,h.pin_code,h.phone,i.name AS insurer_name,l.status,l.source_url,l.last_verified_date${base}${where} ORDER BY h.name,i.name LIMIT ? OFFSET ?`).all(...args,limit,(page-1)*limit);return NextResponse.json({items,total,page,limit})}
