import db from '@/lib/db';

export type ActivityType = 'search' | 'listing_view' | 'correction_report';

export function recordActivity(type: ActivityType) {
  db.prepare(`INSERT INTO site_activity_daily(day,event_type,event_count) VALUES (date('now'),?,1)
    ON CONFLICT(day,event_type) DO UPDATE SET event_count=event_count+1`).run(type);
}
