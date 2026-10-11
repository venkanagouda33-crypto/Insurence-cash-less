import db from '../lib/db';

const count = (db.prepare('SELECT COUNT(*) as n FROM insurers').get() as {n:number}).n;
if (!count) {
  const insurer = db.prepare('INSERT INTO insurers(name) VALUES (?)');
  const hospital = db.prepare('INSERT INTO hospitals(name,address,city,state,pin_code,phone) VALUES (?,?,?,?,?,?)');
  const listing = db.prepare('INSERT INTO hospital_network_listings(hospital_id,insurer_id,source_url,last_verified_date,status,notes) VALUES (?,?,?,?,?,?)');
  const seed = db.transaction(() => {
    const a = Number(insurer.run('Sample Health Assurance').lastInsertRowid);
    const b = Number(insurer.run('Example Care Insurance').lastInsertRowid);
    const h1 = Number(hospital.run('Sample City General Hospital','12 Example Road','Bengaluru','Karnataka','560001','080-0000-0000').lastInsertRowid);
    const h2 = Number(hospital.run('Demo Community Medical Centre','45 Placeholder Avenue','Pune','Maharashtra','411001','020-0000-0000').lastInsertRowid);
    listing.run(h1,a,'https://example.invalid/network-directory','2026-01-15','active','DEVELOPMENT SAMPLE — not verified real-world network data');
    listing.run(h1,b,'https://example.invalid/provider-list','2026-01-15','pending_review','DEVELOPMENT SAMPLE — not verified real-world network data');
    listing.run(h2,a,'https://example.invalid/network-directory','2026-01-15','inactive','DEVELOPMENT SAMPLE — not verified real-world network data');
  });
  seed();
  console.log('Database initialized with clearly labeled development samples.');
} else console.log('Database schema is ready; existing records preserved.');
