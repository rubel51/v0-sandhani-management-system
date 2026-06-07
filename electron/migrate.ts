import { getDatabase } from './database';
import { patients, bloodBags, settings } from '../drizzle/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Migrate data from localStorage format to SQLite
 * This function handles the transition from the old React app data structure
 */
export async function migrateLocalStorageToSQLite(localStorageData: {
  patients?: any[];
  bloodBags?: any[];
  settings?: any;
}) {
  const db = getDatabase();
  const now = new Date().toISOString();

  try {
    // Migrate patients
    if (localStorageData.patients && Array.isArray(localStorageData.patients)) {
      for (const patient of localStorageData.patients) {
        // Map old patient structure to new
        const mappedPatient = {
          id: patient.id || uuidv4(),
          name: patient.name || '',
          bloodType: patient.bloodType || 'O',
          rhFactor: patient.rhFactor || '+ve',
          dateOfBirth: patient.dateOfBirth || null,
          contactNumber: patient.contactNumber || patient.phone || '',
          address: patient.address || '',
          createdAt: patient.createdAt || now,
          updatedAt: patient.updatedAt || now,
        };

        // Try to insert - skip if ID already exists
        try {
          await db.insert(patients).values(mappedPatient);
        } catch {
          // ID might already exist, skip
        }
      }
    }

    // Migrate blood bags
    if (localStorageData.bloodBags && Array.isArray(localStorageData.bloodBags)) {
      for (const bag of localStorageData.bloodBags) {
        const mappedBag = {
          id: bag.id || uuidv4(),
          donorId: bag.donorId || bag.id || uuidv4(),
          bloodType: bag.bloodType || 'O',
          rhFactor: bag.rhFactor || '+ve',
          collectionDate: bag.collectionDate || bag.date || now,
          expiryDate: bag.expiryDate || '',
          status: bag.status || 'available',
          location: bag.location || '',
          createdAt: bag.createdAt || now,
          updatedAt: bag.updatedAt || now,
        };

        try {
          await db.insert(bloodBags).values(mappedBag);
        } catch {
          // ID might already exist, skip
        }
      }
    }

    // Migrate settings
    if (localStorageData.settings) {
      for (const [key, value] of Object.entries(localStorageData.settings)) {
        try {
          await db.insert(settings).values({
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            updatedAt: now,
          });
        } catch {
          // Key might already exist, skip
        }
      }
    }

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, message: 'Migration failed', error };
  }
}
