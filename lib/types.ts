export type Gender = 'Male' | 'Female' | 'Other'

export type BloodGroup = 'A +ve' | 'A -ve' | 'B +ve' | 'B -ve' | 'AB +ve' | 'AB -ve' | 'O +ve' | 'O -ve'

export type TestType = 
  | 'HBsAg'
  | 'HCV'
  | 'HIV'
  | 'MALARIA'
  | 'SYPHILIS'
  | 'Blood Sugar (Fasting)'
  | 'Blood Sugar (2 Hours After)'
  | 'Blood Sugar (Random)'
  | 'Blood Grouping'

export type TestResult = 'Positive' | 'Negative' | 'Reactive' | 'Non Reactive'

export type CrossMatchResult = 'Compatible' | 'Incompatible'

export type Place = 'DDCH' | 'Other'

export type Department = 'Medicine' | 'Surgery' | 'Other'

export type Condition = 'Unconditional' | 'Exchange' | 'Donor Card'

export interface TestEntry {
  test: TestType
  result: TestResult | null
  bloodGroup?: BloodGroup
  sugarValue?: number
}

export interface Patient {
  id: string
  invoiceNumber: string
  name: string
  age: number
  gender: Gender
  phone: string
  date: string
  tests: TestEntry[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface BloodBag {
  id: string
  invoiceNumber: string
  bloodBagNumber: string
  patientName: string
  patientAge: number
  patientGender: Gender
  patientPhone: string
  bloodGroup: BloodGroup
  donorName: string
  donorAge: number
  donorGender: Gender
  donorPhone: string
  place: Place
  department: Department
  condition: Condition
  tests: TestEntry[]
  crossMatch: CrossMatchResult
  totalAmount: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  bloodBagNumberSuffix: string
  hospitalName?: string
}

export interface DashboardStats {
  totalPatients: number
  testCounts: Record<string, number>
  bloodGroupCounts: Record<BloodGroup, number>
  bloodBagCounts: Record<BloodGroup, number>
  totalBloodBags: number
  totalAmount: number
}
