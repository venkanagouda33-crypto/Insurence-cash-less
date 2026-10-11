import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DATABASE_PATH || './data/network.sqlite';
const resolvedPath = path.resolve(dbPath);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
const db = new DatabaseSync(resolvedPath);
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8'));
export default db;
