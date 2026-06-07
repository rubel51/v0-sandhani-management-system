# Electron Migration Implementation Guide

## Overview
The Sandhani Management System has been converted to an Electron desktop application with SQLite database persistence. This guide explains how to integrate the new store layer into your React components.

## Key Changes

### 1. **Store Functions Are Now Async**
All store functions that access data are now asynchronous because they use IPC communication with the Electron main process.

**Before (localStorage):**
```typescript
const patients = getPatients(); // Synchronous
```

**After (Electron):**
```typescript
const patients = await getPatients(); // Asynchronous
```

### 2. **Updated Import Paths**
- Change imports from `lib/store` to `lib/store-electron`
- All functions have the same names but are now async

```typescript
// Old
import { getPatients, savePatient } from '@/lib/store'

// New
import { getPatients, savePatient } from '@/lib/store-electron'
```

### 3. **Using the New Store in Components**

#### Example: Patient List Component
```typescript
'use client'

import { useEffect, useState } from 'react'
import { getPatients, searchPatients } from '@/lib/store-electron'
import { Patient } from '@/lib/types'

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getPatients()
        setPatients(data)
      } catch (error) {
        console.error('Failed to load patients:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{patients.length} patients</div>
}
```

#### Example: Patient Form Component
```typescript
'use client'

import { useState } from 'react'
import { savePatient, generateNextInvoiceNumber } from '@/lib/store-electron'
import { Patient } from '@/lib/types'

export function PatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const invoice = await generateNextInvoiceNumber()
      const patient: Patient = {
        // ... form data
        invoiceNumber: invoice,
      }
      await savePatient(patient)
      // Handle success (e.g., close dialog, refresh list)
    } catch (error) {
      console.error('Failed to save patient:', error)
      // Handle error (e.g., show error toast)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 4. **Available Store Functions**

#### Patient Operations
```typescript
// Get all patients
const patients = await getPatients(): Promise<Patient[]>

// Save patient (create or update)
await savePatient(patient): Promise<void>

// Delete patient
await deletePatient(id): Promise<void>

// Search patients by name, invoice number, or phone
const results = await searchPatients(query): Promise<Patient[]>

// Check if invoice number is unique
const isUnique = isInvoiceNumberUnique(invoiceNumber, excludeId?, patients?)

// Generate next invoice number
const nextInvoice = await generateNextInvoiceNumber(): Promise<string>
```

#### Blood Bag Operations
```typescript
// Get all blood bags
const bags = await getBloodBags(): Promise<BloodBag[]>

// Save blood bag
await saveBloodBag(bag): Promise<void>

// Delete blood bag
await deleteBloodBag(id): Promise<void>

// Search blood bags
const results = await searchBloodBags(query): Promise<BloodBag[]>

// Check if invoice is unique
const isUnique = isBloodBagInvoiceUnique(invoiceNumber, excludeId?, bags?)

// Generate next blood bag number
const nextBagNumber = await generateNextBloodBagNumber(suffix?): Promise<string>
```

#### Settings Operations
```typescript
// Get all settings
const settings = await getSettings(): Promise<Settings>

// Save settings
await saveSettings(settings): Promise<void>
```

#### Dashboard
```typescript
// Get dashboard statistics
const stats = await getDashboardStats(fromDate?, toDate?): Promise<DashboardStats>
```

### 5. **File Operations (Electron Only)**

When running in Electron, use these functions for file operations:

```typescript
const electronAPI = (window as any).electronAPI

// Export data to JSON file
const result = await electronAPI.file.export(data, 'filename.json')
if (result.success) {
  console.log('Exported to:', result.path)
}

// Import data from JSON file
const result = await electronAPI.file.import()
if (result.success) {
  const data = result.data
  // Process imported data
}

// Create backup
const result = await electronAPI.backup.create()
if (result.success) {
  console.log('Backup created at:', result.path)
}
```

### 6. **Error Handling**

All store functions may throw errors. Always wrap them in try-catch blocks:

```typescript
try {
  const patients = await getPatients()
} catch (error) {
  console.error('Failed to load patients:', error)
  // Handle error appropriately
}
```

### 7. **Migration from Old Store**

The new `store-electron.ts` has a fallback to localStorage when not running in Electron. This means:

1. **During Development**: You can test in browser with localStorage
2. **In Production**: The Electron app uses SQLite
3. **Mixed Environment**: If a component tries to access both, Electron takes precedence

### 8. **Component Update Checklist**

When updating components to use the new store:

- [ ] Change import from `lib/store` to `lib/store-electron`
- [ ] Make component functions async where needed
- [ ] Add loading states for async operations
- [ ] Add error handling with try-catch
- [ ] Use useEffect for data fetching
- [ ] Update any useCallback dependencies for async functions
- [ ] Test in both browser (localStorage) and Electron (SQLite)

### 9. **Performance Considerations**

- **Batch Operations**: Try to load all data once rather than making multiple requests
- **Memoization**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Debouncing**: Debounce search queries to reduce IPC calls

```typescript
// Example: Debounced search
import { useMemo } from 'react'
import { debounce } from 'lodash-es'

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    const results = await searchPatients(query)
    setResults(results)
  }, 300),
  []
)
```

## Testing

### Browser Testing (localStorage fallback)
```bash
npm run dev
# Opens at http://localhost:3000
# Uses localStorage for persistence
```

### Electron Testing
```bash
npm run electron:dev
# Starts Next.js dev server + Electron app
# Uses SQLite for persistence
```

## Migration Roadmap

1. ✅ **Phase 1**: Setup Electron base (DONE)
2. ✅ **Phase 2**: Database setup with Drizzle (DONE)
3. ✅ **Phase 3**: IPC handlers implementation (DONE)
4. ⏳ **Phase 4**: Component migration (IN PROGRESS)
5. ⏳ **Phase 5**: File operations & export/import
6. ⏳ **Phase 6**: Backup/restore and settings
7. ⏳ **Phase 7**: Testing and optimization

## Common Issues

### "electronAPI is not defined"
This means the component is trying to use electronAPI in a browser environment. Check:
- Is the component marked with 'use client'?
- Are you in Electron or browser?
- Check preload script permissions

### Async/Await Issues
Remember that all store functions are async now. Make sure to:
- Use `await` when calling store functions
- Wrap in try-catch blocks
- Use useEffect for component data loading

### Database Lock
If you see database lock errors:
- Ensure only one Electron window is open
- Check that previous operations completed
- Clear electron data folder and restart

## Next Steps

1. Start updating components in this order:
   - Patient list and form components
   - Blood bag list and form components
   - Settings page
   - Dashboard component

2. Test each component thoroughly in both browser and Electron

3. Update any remaining localStorage references

4. Remove old store.ts once migration is complete
