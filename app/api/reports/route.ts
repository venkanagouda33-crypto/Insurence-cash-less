import { NextRequest,NextResponse } from 'next/server';
import {z} from 'zod';
import db from '@/lib/db';
import { recordActivity } from '@/lib/activity';
export const dynamic='force-dynamic';
const bodySchema=z.object({listingId:z.number().int().positive(),name:z.string().trim().max(100).optional().default(''),email:z.string().trim().email().max(200).optional().or(z.literal('')).default(''),issue:z.enum(['incorrect','outdated','other']),details:z.string().trim().min(10).max(2000)});
export async function POST(req:NextRequest){let raw;try{raw=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'}, {status:400})}const parsed=bodySchema.safeParse(raw);if(!parsed.success)return NextResponse.json({error:'Please check the form fields and try again.'},{status:400});const item=db.prepare('SELECT id FROM hospital_network_listings WHERE id=?').get(parsed.data.listingId);if(!item)return NextResponse.json({error:'Listing not found'},{status:404});const p=parsed.data;const result=db.prepare('INSERT INTO correction_reports(listing_id,reporter_name,reporter_email,issue,details) VALUES (?,?,?,?,?)').run(p.listingId,p.name,p.email,p.issue,p.details);recordActivity('correction_report');return NextResponse.json({id:Number(result.lastInsertRowid),message:'Thank you. Your report is queued for review.'},{status:201})}
