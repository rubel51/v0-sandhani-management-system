import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../drizzle/schema';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;

export function initializeDatabase(dbPath: string) {
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  
  db = drizzle(sqlite, { schema });
  
  // Create tables - using raw SQL through better-sqlite3
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      rh_factor TEXT NOT NULL,
      date_of_birth TEXT,
      contact_number TEXT,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blood_bags (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      rh_factor TEXT NOT NULL,
      collection_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      location TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transaction_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      changes TEXT
    );
  `);

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
  }
}

export { schema };
