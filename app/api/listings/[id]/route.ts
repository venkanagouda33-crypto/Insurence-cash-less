import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { recordActivity } from '@/lib/activity';
export const dynamic='force-dynamic';
const schema=z.coerce.number().int().positive();
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;const parsed=schema.safeParse(id);if(!parsed.success)return NextResponse.json({error:'Invalid listing id'}, {status:400});const item=db.prepare(`SELECT l.id,l.hospital_id,h.name AS hospital_name,h.address,h.city,h.state,h.pin_code,h.phone,i.name AS insurer_name,l.status,l.source_url,l.last_verified_date FROM hospital_network_listings l JOIN hospitals h ON h.id=l.hospital_id JOIN insurers i ON i.id=l.insurer_id WHERE l.id=?`).get(parsed.data);if(!item)return NextResponse.json({error:'Listing not found'}, {status:404});recordActivity('listing_view');return NextResponse.json(item)}
