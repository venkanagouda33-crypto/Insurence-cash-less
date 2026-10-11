PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS insurers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hospitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hospital_network_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hospital_id INTEGER NOT NULL REFERENCES hospitals(id),
  insurer_id INTEGER NOT NULL REFERENCES insurers(id),
  source_url TEXT NOT NULL,
  last_verified_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active','inactive','pending_review')),
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hospital_id, insurer_id)
);
CREATE TABLE IF NOT EXISTS correction_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES hospital_network_listings(id),
  reporter_name TEXT,
  reporter_email TEXT,
  issue TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewed','resolved','dismissed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS site_activity_daily (
  day TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('search','listing_view','correction_report')),
  event_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day, event_type)
);
CREATE INDEX IF NOT EXISTS idx_hospitals_city_pin ON hospitals(city, pin_code);
CREATE INDEX IF NOT EXISTS idx_listings_status ON hospital_network_listings(status);
