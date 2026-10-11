# NetworkCheck

A first version of a directory for checking whether a hospital-insurer pair has a cashless-network listing. This project starts with **development-only sample data**. It does not contain verified real insurer or hospital network information.

## Stack

- Next.js App Router, React, TypeScript
- Node's built-in SQLite module for local persistent storage (Node 22.13 or newer)
- Zod validation for search, report, and admin API inputs

SQLite is used because this workspace had no existing database infrastructure. Node's built-in SQLite avoids a separately compiled native add-on. The schema is isolated in `db/schema.sql`; it can be migrated to PostgreSQL when a hosted deployment is planned.

## Run locally

Requirements: Node.js 20 or later and npm.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env.local` and set a unique `ADMIN_ID`, `ADMIN_PASSWORD`, and long random `ADMIN_SESSION_SECRET`.
3. Create the database and development samples: `npm run db:init`
4. Start the app bound to the local machine: `npm run dev -- --hostname 127.0.0.1`
5. Open `http://127.0.0.1:3000` and use the same admin key at `/admin`.

The SQLite file defaults to `./data/network.sqlite`; `DATABASE_PATH` can point to a different local path. Database files are ignored by Git. Keep `.env.local` and database backups private. Do not expose the local admin route on a public network. Credentials and the session signing secret are checked on the server and must never use `NEXT_PUBLIC_` names. Successful sign-in creates an eight-hour, HTTP-only, same-site session cookie.

If admin credentials or the session secret are missing, admin API actions fail closed. This local sign-in is suitable for a developer-only setup, not for deployment to an internet-facing service. A deployed service needs production authentication, access controls, rate limiting, and operational secret management.

## Database model

- `insurers`: insurer directory
- `hospitals`: canonical hospital contact and location data
- `hospital_network_listings`: a hospital-insurer relationship, source URL, verification date, status, and notes
- `correction_reports`: public reports tied to a listing, with an admin review status

Hospital records are separate from listings so one hospital can be associated with multiple insurers. Listing states are `active`, `inactive`, and `pending_review`. Correction reports track `open`, `reviewed`, `resolved`, or `dismissed`.

## API

- `GET /api/insurers`
- `GET /api/listings?q=&insurer=&page=1&limit=8` (maximum page size 50)
- `GET /api/listings/:id`
- `POST /api/reports` with `{listingId, name?, email?, issue, details}`
- `GET /api/admin` and `POST /api/admin` require `x-admin-key`

The public correction form asks for a description and optional contact details. It must not be used to collect policy numbers, medical records, or other sensitive health information.

## Anonymous activity totals

The admin workspace shows counts for searches, listing detail views, and correction submissions over the last seven days. It stores only daily event totals in `site_activity_daily`; it does not store visitor IDs, IP addresses, or search terms. This is an aggregate usage overview, not a way to monitor individual customers.

## Verified data workflow

1. Obtain the insurer's current provider directory or another authoritative source, and retain its URL and retrieval evidence.
2. Normalize hospital identity and contact details, keeping the hospital row separate from insurer-specific network status.
3. Add or update each hospital-insurer listing in `/admin`; record the source URL and the date a person checked the source. Use `pending_review` until the record has been checked. Mark removals `inactive` rather than deleting history.
4. Review correction reports against an authoritative source before changing a listing. Update `last_verified_date` only after verification and keep source notes internally as appropriate.
5. Recheck listings on a defined schedule and after insurer directory changes. Export and back up the database securely before bulk imports.

The seeded insurer and hospital names, addresses, phone numbers, statuses, and dates are fictional placeholders. Sources use the reserved `.invalid` domain and are intentionally not real links. Remove the sample rows and import checked records before presenting the directory as real coverage information.

## Claim and data disclaimer

A network listing does not guarantee approval of a specific insurance claim. Network participation and cashless availability can change and can depend on policy terms and circumstances. Users should confirm current availability directly with both the insurer and hospital.

