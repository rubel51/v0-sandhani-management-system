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

// Storage helpers
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
export function getPatients(): Patient[] {
  return getFromStorage<Patient[]>(STORAGE_KEYS.patients, [])
}

export function savePatient(patient: Patient): void {
  const patients = getPatients()
  const existingIndex = patients.findIndex(p => p.id === patient.id)
  
  if (existingIndex >= 0) {
    patients[existingIndex] = { ...patient, updatedAt: new Date().toISOString() }
  } else {
    patients.push(patient)
  }
  
  setToStorage(STORAGE_KEYS.patients, patients)
}

export function deletePatient(id: string): void {
  const patients = getPatients().filter(p => p.id !== id)
  setToStorage(STORAGE_KEYS.patients, patients)
}

export function searchPatients(query: string): Patient[] {
  const patients = getPatients()
  if (!query.trim()) return patients
  
  const lowerQuery = query.toLowerCase()
  return patients.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    p.phone.includes(query)
  )
}

export function isInvoiceNumberUnique(invoiceNumber: string, excludeId?: string): boolean {
  const patients = getPatients()
  return !patients.some(p => p.invoiceNumber === invoiceNumber && p.id !== excludeId)
}

// Blood Bag operations
export function getBloodBags(): BloodBag[] {
  return getFromStorage<BloodBag[]>(STORAGE_KEYS.bloodBags, [])
}

export function saveBloodBag(bloodBag: BloodBag): void {
  const bloodBags = getBloodBags()
  const existingIndex = bloodBags.findIndex(b => b.id === bloodBag.id)
  
  if (existingIndex >= 0) {
    bloodBags[existingIndex] = { ...bloodBag, updatedAt: new Date().toISOString() }
  } else {
    bloodBags.push(bloodBag)
  }
  
  setToStorage(STORAGE_KEYS.bloodBags, bloodBags)
}

export function deleteBloodBag(id: string): void {
  const bloodBags = getBloodBags().filter(b => b.id !== id)
  setToStorage(STORAGE_KEYS.bloodBags, bloodBags)
}

export function searchBloodBags(query: string): BloodBag[] {
  const bloodBags = getBloodBags()
  if (!query.trim()) return bloodBags
  
  const lowerQuery = query.toLowerCase()
  return bloodBags.filter(b => 
    b.patientName.toLowerCase().includes(lowerQuery) ||
    b.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    b.patientPhone.includes(query)
  )
}

export function isBloodBagInvoiceUnique(invoiceNumber: string, excludeId?: string): boolean {
  const bloodBags = getBloodBags()
  return !bloodBags.some(b => b.invoiceNumber === invoiceNumber && b.id !== excludeId)
}

// Settings operations
export function getSettings(): Settings {
  return getFromStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
}

export function saveSettings(settings: Settings): void {
  setToStorage(STORAGE_KEYS.settings, settings)
}

// Dashboard statistics
export function getDashboardStats(fromDate?: string, toDate?: string): DashboardStats {
  let patients = getPatients()
  let bloodBags = getBloodBags()
  
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

// Generate next invoice number
export function generateNextInvoiceNumber(): string {
  const patients = getPatients()
  const bloodBags = getBloodBags()
  
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
export function generateNextBloodBagNumber(suffix: string = ''): string {
  const bloodBags = getBloodBags()
  
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
