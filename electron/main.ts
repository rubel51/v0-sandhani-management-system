import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { initializeDatabase, getDatabase, closeDatabase } from './database';
import { patients, bloodBags, settings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', () => {
  const dbPath = path.join(app.getPath('userData'), 'sandhani.db');
  initializeDatabase(dbPath);
  createWindow();
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Patient IPC Handlers
ipcMain.handle('patients:list', async () => {
  try {
    const db = getDatabase();
    return await db.query.patients.findMany();
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
});

ipcMain.handle('patients:get', async (event, id: string) => {
  try {
    const db = getDatabase();
    return await db.query.patients.findFirst({ where: eq(patients.id, id) });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
});

ipcMain.handle('patients:create', async (event, patient) => {
  try {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.insert(patients).values({
      id,
      name: patient.name,
      bloodType: patient.bloodType,
      rhFactor: patient.rhFactor,
      dateOfBirth: patient.dateOfBirth || null,
      contactNumber: patient.contactNumber || null,
      address: patient.address || null,
      createdAt: now,
      updatedAt: now,
    });

    return { id, ...patient, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
});

ipcMain.handle('patients:update', async (event, id: string, patient) => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    await db
      .update(patients)
      .set({
        name: patient.name,
        bloodType: patient.bloodType,
        rhFactor: patient.rhFactor,
        dateOfBirth: patient.dateOfBirth || null,
        contactNumber: patient.contactNumber || null,
        address: patient.address || null,
        updatedAt: now,
      })
      .where(eq(patients.id, id));

    return { id, ...patient, updatedAt: now };
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
});

ipcMain.handle('patients:delete', async (event, id: string) => {
  try {
    const db = getDatabase();
    await db.delete(patients).where(eq(patients.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
});

// Blood Bag IPC Handlers
ipcMain.handle('bloodBags:list', async () => {
  try {
    const db = getDatabase();
    return await db.query.bloodBags.findMany();
  } catch (error) {
    console.error('Error fetching blood bags:', error);
    return [];
  }
});

ipcMain.handle('bloodBags:get', async (event, id: string) => {
  try {
    const db = getDatabase();
    return await db.query.bloodBags.findFirst({ where: eq(bloodBags.id, id) });
  } catch (error) {
    console.error('Error fetching blood bag:', error);
    return null;
  }
});

ipcMain.handle('bloodBags:create', async (event, bag) => {
  try {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(bloodBags).values({
      id,
      donorId: bag.donorId,
      bloodType: bag.bloodType,
      rhFactor: bag.rhFactor,
      collectionDate: bag.collectionDate,
      expiryDate: bag.expiryDate,
      status: bag.status || 'available',
      location: bag.location || null,
      createdAt: now,
      updatedAt: now,
    });

    return { id, ...bag, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('Error creating blood bag:', error);
    throw error;
  }
});

ipcMain.handle('bloodBags:update', async (event, id: string, bag) => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    await db
      .update(bloodBags)
      .set({
        donorId: bag.donorId,
        bloodType: bag.bloodType,
        rhFactor: bag.rhFactor,
        collectionDate: bag.collectionDate,
        expiryDate: bag.expiryDate,
        status: bag.status,
        location: bag.location || null,
        updatedAt: now,
      })
      .where(eq(bloodBags.id, id));

    return { id, ...bag, updatedAt: now };
  } catch (error) {
    console.error('Error updating blood bag:', error);
    throw error;
  }
});

ipcMain.handle('bloodBags:delete', async (event, id: string) => {
  try {
    const db = getDatabase();
    await db.delete(bloodBags).where(eq(bloodBags.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting blood bag:', error);
    throw error;
  }
});

// Settings IPC Handlers
ipcMain.handle('settings:get', async (event, key: string) => {
  try {
    const db = getDatabase();
    return await db.query.settings.findFirst({ where: eq(settings.key, key) });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
});

ipcMain.handle('settings:set', async (event, key: string, value: string) => {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existing = await db.query.settings.findFirst({ where: eq(settings.key, key) });

    if (existing) {
      await db
        .update(settings)
        .set({ value, updatedAt: now })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value, updatedAt: now });
    }

    return { key, value, updatedAt: now };
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
});

// File Export/Import
ipcMain.handle('file:export', async (event, data: any, fileName: string) => {
  try {
    if (!mainWindow) return { success: false };

    const result = await dialog.showSaveDialog(mainWindow, {
      fileName: fileName,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    }

    return { success: false };
  } catch (error) {
    console.error('Error exporting file:', error);
    throw error;
  }
});

ipcMain.handle('file:import', async () => {
  try {
    if (!mainWindow) return { success: false };

    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
      return { success: true, data };
    }

    return { success: false };
  } catch (error) {
    console.error('Error importing file:', error);
    throw error;
  }
});

// Backup functionality
ipcMain.handle('backup:create', async () => {
  try {
    const db = getDatabase();
    
    const patientsList = await db.query.patients.findMany();
    const bagsList = await db.query.bloodBags.findMany();

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patients: patientsList,
      bloodBags: bagsList,
    };

    if (!mainWindow) return { success: false };

    const result = await dialog.showSaveDialog(mainWindow, {
      fileName: `sandhani-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(backup, null, 2));
      return { success: true, path: result.filePath };
    }

    return { success: false };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
});

