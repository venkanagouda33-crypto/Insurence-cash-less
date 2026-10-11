import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const insurers = db.prepare(`SELECT i.name,COUNT(l.id) AS listings FROM insurers i JOIN hospital_network_listings l ON l.insurer_id=i.id WHERE l.status='active' GROUP BY i.id,i.name ORDER BY listings DESC,i.name LIMIT 4`).all();
  const cities = db.prepare(`SELECT h.city,COUNT(l.id) AS listings FROM hospitals h JOIN hospital_network_listings l ON l.hospital_id=h.id WHERE l.status='active' GROUP BY h.city ORDER BY listings DESC,h.city LIMIT 4`).all();
  const recent = db.prepare(`SELECT l.id,h.name AS hospital_name,h.city,i.name AS insurer_name,l.last_verified_date FROM hospital_network_listings l JOIN hospitals h ON h.id=l.hospital_id JOIN insurers i ON i.id=l.insurer_id WHERE l.status='active' ORDER BY l.last_verified_date DESC,l.id DESC LIMIT 3`).all();
  return NextResponse.json({ insurers, cities, recent });
}
