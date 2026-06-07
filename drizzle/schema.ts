import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const patients = sqliteTable('patients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bloodType: text('blood_type').notNull(),
  rhFactor: text('rh_factor').notNull(),
  dateOfBirth: text('date_of_birth'),
  contactNumber: text('contact_number'),
  address: text('address'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bloodBags = sqliteTable('blood_bags', {
  id: text('id').primaryKey(),
  donorId: text('donor_id').notNull(),
  bloodType: text('blood_type').notNull(),
  rhFactor: text('rh_factor').notNull(),
  collectionDate: text('collection_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  status: text('status').notNull().default('available'),
  location: text('location'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const transactionLogs = sqliteTable('transaction_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  entityId: text('entity_id').notNull(),
  timestamp: text('timestamp')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  changes: text('changes'),
});
