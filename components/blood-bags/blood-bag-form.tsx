'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  BloodBag, Gender, BloodGroup, Place, Department, Condition, 
  TestEntry, TestResult, CrossMatchResult 
} from '@/lib/types'
import { saveBloodBag, isBloodBagInvoiceUnique, generateNextInvoiceNumber, generateNextBloodBagNumber, getSettings } from '@/lib/store-electron'

const GENDERS: Gender[] = ['Male', 'Female', 'Other']
const BLOOD_GROUPS: BloodGroup[] = ['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve']
const PLACES: (Place | 'Other')[] = ['DDCH', 'Other']
const DEPARTMENTS: (Department | 'Other')[] = ['Medicine', 'Surgery', 'Other']
const CONDITIONS: Condition[] = ['Unconditional', 'Exchange', 'Donor Card']

const BLOOD_BAG_TESTS = ['HBsAg', 'HCV', 'HIV', 'MALARIA', 'SYPHILIS'] as const

interface BloodBagFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bloodBag?: BloodBag | null
  onSave: () => void
}

export function BloodBagForm({ open, onOpenChange, bloodBag, onSave }: BloodBagFormProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    bloodBagNumber: '',
    patientName: '',
    patientAge: '',
    patientGender: '' as Gender | '',
    patientPhone: '',
    bloodGroup: '' as BloodGroup | '',
    donorName: '',
    donorAge: '',
    donorGender: '' as Gender | '',
    donorPhone: '',
    place: '' as Place | '',
    department: '' as Department | '',
    condition: '' as Condition | '',
    crossMatch: '' as CrossMatchResult | '',
    amount: '',
    date: new Date(),
  })
  const [testResults, setTestResults] = useState<Record<string, TestResult | null>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  useEffect(() => {
    if (open) {
      if (bloodBag) {
        setFormData({
          invoiceNumber: bloodBag.invoiceNumber,
          bloodBagNumber: bloodBag.bloodBagNumber,
          patientName: bloodBag.patientName,
          patientAge: bloodBag.patientAge.toString(),
          patientGender: bloodBag.patientGender,
          patientPhone: bloodBag.patientPhone,
          bloodGroup: bloodBag.bloodGroup,
          donorName: bloodBag.donorName,
          donorAge: bloodBag.donorAge.toString(),
          donorGender: bloodBag.donorGender,
          donorPhone: bloodBag.donorPhone,
          place: bloodBag.place,
          department: bloodBag.department,
          condition: bloodBag.condition,
          crossMatch: bloodBag.crossMatch,
          amount: bloodBag.totalAmount.toString(),
          date: new Date(bloodBag.date),
        })
        const results: Record<string, TestResult | null> = {}
        bloodBag.tests.forEach(t => {
          results[t.test] = t.result
        })
        setTestResults(results)
      } else {
        const loadNextNumbers = async () => {
          try {
            const settings = await getSettings()
            const nextInvoice = await generateNextInvoiceNumber()
            const nextBloodBagNo = await generateNextBloodBagNumber(settings.bloodBagNumberSuffix)
            setFormData(prev => ({
              ...prev,
              invoiceNumber: nextInvoice,
              bloodBagNumber: nextBloodBagNo,
              place: (settings.hospitalName || 'DDCH') as Place,
            }))
          } catch (error) {
            console.error('Failed to generate numbers:', error)
            setFormData(prev => ({
              ...prev,
              invoiceNumber: '',
              bloodBagNumber: '',
            }))
          }
        }
        loadNextNumbers()
        
        setFormData(prev => ({
          ...prev,
          patientName: '',
          patientAge: '',
          patientGender: '',
          patientPhone: '',
          bloodGroup: '',
          donorName: '',
          donorAge: '',
          donorGender: '',
          donorPhone: '',
          place: '',
          department: '',
          condition: '',
          crossMatch: '',
          amount: '',
          date: new Date(),
        }))
        setTestResults({})
      }
      setErrors({})
    }
  }, [open, bloodBag])

  const validatePhone = (phone: string): boolean => {
    return /^\d{11}$/.test(phone)
  }

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required'
    } else {
      const isUnique = isBloodBagInvoiceUnique(formData.invoiceNumber, bloodBag?.id)
      if (!isUnique) {
        newErrors.invoiceNumber = 'Invoice number already exists'
      }
    }

    if (!formData.bloodBagNumber.trim()) {
      newErrors.bloodBagNumber = 'Blood bag number is required'
    }

    // Patient validation
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required'
    }
    if (!formData.patientAge || parseInt(formData.patientAge) <= 0) {
      newErrors.patientAge = 'Valid age is required'
    }
    if (!formData.patientGender) {
      newErrors.patientGender = 'Gender is required'
    }
    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone is required'
    } else if (!validatePhone(formData.patientPhone)) {
      newErrors.patientPhone = 'Phone must be 11 digits'
    }
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required'
    }

    // Donor validation
    if (!formData.donorName.trim()) {
      newErrors.donorName = 'Donor name is required'
    }
    if (!formData.donorAge || parseInt(formData.donorAge) <= 0) {
      newErrors.donorAge = 'Valid age is required'
    }
    if (!formData.donorGender) {
      newErrors.donorGender = 'Gender is required'
    }
    if (!formData.donorPhone.trim()) {
      newErrors.donorPhone = 'Phone is required'
    } else if (!validatePhone(formData.donorPhone)) {
      newErrors.donorPhone = 'Phone must be 11 digits'
    }

    // Test results validation
    for (const test of BLOOD_BAG_TESTS) {
      if (!testResults[test]) {
        newErrors[`result_${test}`] = 'Result required'
      }
    }

    // Other fields
    if (!formData.place) {
      newErrors.place = 'Place is required'
    }
    if (!formData.department) {
      newErrors.department = 'Department is required'
    }
    if (!formData.condition) {
      newErrors.condition = 'Condition is required'
    }
    if (!formData.crossMatch) {
      newErrors.crossMatch = 'Cross match result is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validate()
    if (!isValid) return
    
    setIsSubmitting(true)

    try {
      const tests: TestEntry[] = BLOOD_BAG_TESTS.map(test => ({
        test,
        result: testResults[test] || null,
      }))

      const bloodBagData: BloodBag = {
        id: bloodBag?.id || uuidv4(),
        invoiceNumber: formData.invoiceNumber,
        bloodBagNumber: formData.bloodBagNumber,
        patientName: formData.patientName.trim(),
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender as Gender,
        patientPhone: formData.patientPhone,
        bloodGroup: formData.bloodGroup as BloodGroup,
        donorName: formData.donorName.trim(),
        donorAge: parseInt(formData.donorAge),
        donorGender: formData.donorGender as Gender,
        donorPhone: formData.donorPhone,
        place: formData.place as Place,
        department: formData.department as Department,
        condition: formData.condition as Condition,
        tests,
        crossMatch: formData.crossMatch as CrossMatchResult,
        totalAmount: formData.amount ? parseInt(formData.amount) : 0,
        date: format(formData.date, 'yyyy-MM-dd'),
        createdAt: bloodBag?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveBloodBag(bloodBagData)
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save blood bag:', error)
      setErrors({
        submit: 'Failed to save blood bag. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getResultOptions = (test: string): TestResult[] => {
    if (test === 'MALARIA') {
      return ['Reactive', 'Non Reactive']
    }
    return ['Positive', 'Negative']
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bloodBag ? 'Edit Blood Bag Entry' : 'Add New Blood Bag Entry'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice & Basic Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData(prev => ({ ...prev, invoiceNumber: value }))
                }}
                placeholder="Numbers only"
                className={errors.invoiceNumber ? 'border-destructive' : ''}
              />
              {errors.invoiceNumber && <p className="text-sm text-destructive">{errors.invoiceNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodBagNumber">Blood Bag Number *</Label>
              <Input
                id="bloodBagNumber"
                value={formData.bloodBagNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9()\/-]/g, '')
                  setFormData(prev => ({ ...prev, bloodBagNumber: value }))
                }}
                placeholder="Numbers/letters only"
                className={errors.bloodBagNumber ? 'border-destructive' : ''}
              />
              {errors.bloodBagNumber && <p className="text-sm text-destructive">{errors.bloodBagNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, date }))
                        setDatePickerOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Patient Information */}
          <div>
            <h3 className="mb-4 font-semibold text-primary">Patient Information</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input
                  value={formData.patientName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s.]/g, '')
                    setFormData(prev => ({ ...prev, patientName: value }))
                  }}
                  className={errors.patientName ? 'border-destructive' : ''}
                  placeholder="Patient Name"
                />
                {errors.patientName && <p className="text-sm text-destructive">{errors.patientName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Age *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.patientAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                  className={errors.patientAge ? 'border-destructive' : ''}
                />
                {errors.patientAge && <p className="text-sm text-destructive">{errors.patientAge}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={formData.patientGender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, patientGender: value as Gender }))}
                >
                  <SelectTrigger className={errors.patientGender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.patientGender && <p className="text-sm text-destructive">{errors.patientGender}</p>}
              </div>

              <div className="space-y-2">
                <Label>Phone * (11 digits)</Label>
                <Input
                  value={formData.patientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                  className={errors.patientPhone ? 'border-destructive' : ''}
                />
                {errors.patientPhone && <p className="text-sm text-destructive">{errors.patientPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label>Blood Group *</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bloodGroup: value as BloodGroup }))}
                >
                  <SelectTrigger className={errors.bloodGroup ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.bloodGroup && <p className="text-sm text-destructive">{errors.bloodGroup}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Donor Information */}
          <div>
            <h3 className="mb-4 font-semibold text-[oklch(0.55_0.22_25)]">Donor Information</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Donor Name *</Label>
                <Input
                  value={formData.donorName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s.]/g, '')
                    setFormData(prev => ({ ...prev, donorName: value }))
                  }}
                  className={errors.donorName ? 'border-destructive' : ''}
                  placeholder="Donor Name"
                />
                {errors.donorName && <p className="text-sm text-destructive">{errors.donorName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Age *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.donorAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, donorAge: e.target.value }))}
                  className={errors.donorAge ? 'border-destructive' : ''}
                />
                {errors.donorAge && <p className="text-sm text-destructive">{errors.donorAge}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={formData.donorGender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, donorGender: value as Gender }))}
                >
                  <SelectTrigger className={errors.donorGender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.donorGender && <p className="text-sm text-destructive">{errors.donorGender}</p>}
              </div>

              <div className="space-y-2">
                <Label>Phone * (11 digits)</Label>
                <Input
                  value={formData.donorPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, donorPhone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                  className={errors.donorPhone ? 'border-destructive' : ''}
                />
                {errors.donorPhone && <p className="text-sm text-destructive">{errors.donorPhone}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Fields */}
          <div>
            <h3 className="mb-4 font-semibold">Additional Information</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Place *</Label>
                <Select
                  value={formData.place}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, place: value as Place }))}
                >
                  <SelectTrigger className={errors.place ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.place && <p className="text-sm text-destructive">{errors.place}</p>}
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value as Department }))}
                >
                  <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as Condition }))}
                >
                  <SelectTrigger className={errors.condition ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-sm text-destructive">{errors.condition}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Results */}
          <div>
            <h3 className="mb-4 font-semibold">Test Results *</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BLOOD_BAG_TESTS.map((test) => (
                <div key={test} className="space-y-2 rounded-lg border p-3">
                  <Label className="text-sm font-medium">{test}</Label>
                  <Select
                    value={testResults[test] || ''}
                    onValueChange={(value) => setTestResults(prev => ({ ...prev, [test]: value as TestResult }))}
                  >
                    <SelectTrigger className={errors[`result_${test}`] ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {getResultOptions(test).map((result) => (
                        <SelectItem key={result} value={result}>{result}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`result_${test}`] && (
                    <p className="text-sm text-destructive">{errors[`result_${test}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cross Matching */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cross Matching Result *</Label>
              <Select
                value={formData.crossMatch}
                onValueChange={(value) => setFormData(prev => ({ ...prev, crossMatch: value as CrossMatchResult }))}
              >
                <SelectTrigger className={errors.crossMatch ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Compatible">Compatible</SelectItem>
                  <SelectItem value="Incompatible">Incompatible</SelectItem>
                </SelectContent>
              </Select>
              {errors.crossMatch && <p className="text-sm text-destructive">{errors.crossMatch}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : bloodBag ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
