'use client'

import { Patient, BloodBag, Settings, DashboardStats, BloodGroup } from './types'

const STORAGE_KEYS = {
  patients: 'sandhani_patients',
  bloodBags: 'sandhani_blood_bags',
  settings: 'sandhani_settings',
}

const DEFAULT_SETTINGS: Settings = {
  bloodBagNumberSuffix: '',
}

const BLOOD_GROUPS: BloodGroup[] = ['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve']

// Check if we're in Electron environment
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI !== undefined

// Storage helpers for localStorage fallback
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Patient operations
export async function getPatients(): Promise<Patient[]> {
  if (isElectron) {
    try {
      return await (window as any).electronAPI.patients.list()
    } catch (error) {
      console.error('Error fetching patients from Electron:', error)
      return getFromStorage<Patient[]>(STORAGE_KEYS.patients, [])
    }
  }
  return getFromStorage<Patient[]>(STORAGE_KEYS.patients, [])
}

export async function savePatient(patient: Patient): Promise<void> {
  if (isElectron) {
    try {
      const existing = await (window as any).electronAPI.patients.get(patient.id)
      if (existing) {
        await (window as any).electronAPI.patients.update(patient.id, patient)
      } else {
        await (window as any).electronAPI.patients.create(patient)
      }
      return
    } catch (error) {
      console.error('Error saving patient to Electron:', error)
    }
  }

  // Fallback to localStorage
  const patients = getFromStorage<Patient[]>(STORAGE_KEYS.patients, [])
  const existingIndex = patients.findIndex(p => p.id === patient.id)
  
  if (existingIndex >= 0) {
    patients[existingIndex] = { ...patient, updatedAt: new Date().toISOString() }
  } else {
    patients.push(patient)
  }
  
  setToStorage(STORAGE_KEYS.patients, patients)
}

export async function deletePatient(id: string): Promise<void> {
  if (isElectron) {
    try {
      await (window as any).electronAPI.patients.delete(id)
      return
    } catch (error) {
      console.error('Error deleting patient from Electron:', error)
    }
  }

  // Fallback to localStorage
  const patients = getFromStorage<Patient[]>(STORAGE_KEYS.patients, []).filter(p => p.id !== id)
  setToStorage(STORAGE_KEYS.patients, patients)
}

export async function searchPatients(query: string): Promise<Patient[]> {
  const patients = await getPatients()
  if (!query.trim()) return patients
  
  const lowerQuery = query.toLowerCase()
  return patients.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    p.phone.includes(query)
  )
}

export function isInvoiceNumberUnique(invoiceNumber: string, excludeId?: string, patients?: Patient[]): boolean {
  const patientsList = patients || getFromStorage<Patient[]>(STORAGE_KEYS.patients, [])
  return !patientsList.some(p => p.invoiceNumber === invoiceNumber && p.id !== excludeId)
}

// Blood Bag operations
export async function getBloodBags(): Promise<BloodBag[]> {
  if (isElectron) {
    try {
      return await (window as any).electronAPI.bloodBags.list()
    } catch (error) {
      console.error('Error fetching blood bags from Electron:', error)
      return getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, [])
    }
  }
  return getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, [])
}

export async function saveBloodBag(bloodBag: BloodBag): Promise<void> {
  if (isElectron) {
    try {
      const existing = await (window as any).electronAPI.bloodBags.get(bloodBag.id)
      if (existing) {
        await (window as any).electronAPI.bloodBags.update(bloodBag.id, bloodBag)
      } else {
        await (window as any).electronAPI.bloodBags.create(bloodBag)
      }
      return
    } catch (error) {
      console.error('Error saving blood bag to Electron:', error)
    }
  }

  // Fallback to localStorage
  const bloodBags = getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, [])
  const existingIndex = bloodBags.findIndex(b => b.id === bloodBag.id)
  
  if (existingIndex >= 0) {
    bloodBags[existingIndex] = { ...bloodBag, updatedAt: new Date().toISOString() }
  } else {
    bloodBags.push(bloodBag)
  }
  
  setToStorage(STORAGE_KEYS.bloodBags, bloodBags)
}

export async function deleteBloodBag(id: string): Promise<void> {
  if (isElectron) {
    try {
      await (window as any).electronAPI.bloodBags.delete(id)
      return
    } catch (error) {
      console.error('Error deleting blood bag from Electron:', error)
    }
  }

  // Fallback to localStorage
  const bloodBags = getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, []).filter(b => b.id !== id)
  setToStorage(STORAGE_KEYS.bloodBags, bloodBags)
}

export async function searchBloodBags(query: string): Promise<BloodBag[]> {
  const bloodBags = await getBloodBags()
  if (!query.trim()) return bloodBags
  
  const lowerQuery = query.toLowerCase()
  return bloodBags.filter(b => 
    b.patientName.toLowerCase().includes(lowerQuery) ||
    b.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    b.patientPhone.includes(query)
  )
}

export function isBloodBagInvoiceUnique(invoiceNumber: string, excludeId?: string, bloodBags?: BloodBag[]): boolean {
  const bagsList = bloodBags || getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, [])
  return !bagsList.some(b => b.invoiceNumber === invoiceNumber && b.id !== excludeId)
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  if (isElectron) {
    try {
      const result = await (window as any).electronAPI.settings.get('settings')
      if (result && result.value) {
        return JSON.parse(result.value)
      }
    } catch (error) {
      console.error('Error fetching settings from Electron:', error)
    }
  }
  return getFromStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (isElectron) {
    try {
      await (window as any).electronAPI.settings.set('settings', JSON.stringify(settings))
      return
    } catch (error) {
      console.error('Error saving settings to Electron:', error)
    }
  }

  // Fallback to localStorage
  setToStorage(STORAGE_KEYS.settings, settings)
}

// Generate next invoice number
export async function generateNextInvoiceNumber(): Promise<string> {
  const patients = await getPatients()
  const bloodBags = await getBloodBags()
  
  const allInvoices = [
    ...patients.map(p => p.invoiceNumber),
    ...bloodBags.map(b => b.invoiceNumber),
  ]
  
  let maxNum = 0
  allInvoices.forEach(inv => {
    const match = inv.match(/^(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  })
  
  return `${maxNum + 1}`
}

// Generate next blood bag number with suffix
export async function generateNextBloodBagNumber(suffix: string = ''): Promise<string> {
  const bloodBags = await getBloodBags()
  
  let maxNum = 0
  bloodBags.forEach(b => {
    const match = b.bloodBagNumber.match(/^(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  })
  
  const nextNum = maxNum + 1
  return suffix ? `${nextNum}/${suffix}` : `${nextNum}`
}
  let patients = await getPatients()
  let bloodBags = await getBloodBags()
  
  // Filter by date range if provided
  if (fromDate && toDate) {
    const from = new Date(fromDate)
    from.setHours(0, 0, 0, 0)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)
    
    patients = patients.filter(p => {
      const date = new Date(p.date)
      return date >= from && date <= to
    })
    
    bloodBags = bloodBags.filter(b => {
      const date = new Date(b.date)
      return date >= from && date <= to
    })
  }
  
  // Calculate test counts
  const testCounts: Record<string, number> = {
    HBsAg: 0,
    HCV: 0,
    HIV: 0,
    MALARIA: 0,
    SYPHILIS: 0,
    'Blood Sugar': 0,
  }
  
  patients.forEach(p => {
    p.tests.forEach(t => {
      if (t.test.includes('Blood Sugar')) {
        testCounts['Blood Sugar']++
      } else if (testCounts[t.test] !== undefined) {
        testCounts[t.test]++
      }
    })
  })
  
  // Calculate blood group counts from patients
  const bloodGroupCounts: Record<BloodGroup, number> = {} as Record<BloodGroup, number>
  BLOOD_GROUPS.forEach(bg => { bloodGroupCounts[bg] = 0 })
  
  patients.forEach(p => {
    const bgTest = p.tests.find(t => t.test === 'Blood Grouping' && t.bloodGroup)
    if (bgTest && bgTest.bloodGroup) {
      bloodGroupCounts[bgTest.bloodGroup]++
    }
  })
  
  // Calculate blood bag counts
  const bloodBagCounts: Record<BloodGroup, number> = {} as Record<BloodGroup, number>
  BLOOD_GROUPS.forEach(bg => { bloodBagCounts[bg] = 0 })
  
  bloodBags.forEach(b => {
    bloodBagCounts[b.bloodGroup]++
  })
  
  // Calculate total amount
  const patientAmount = patients.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
  const bloodBagAmount = bloodBags.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  
  return {
    totalPatients: patients.length,
    testCounts,
    bloodGroupCounts,
    bloodBagCounts,
    totalBloodBags: bloodBags.length,
    totalAmount: patientAmount + bloodBagAmount,
  }
}
