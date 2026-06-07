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
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Patient, Gender, TestType, TestEntry, BloodGroup, TestResult } from '@/lib/types'
import { savePatient, isInvoiceNumberUnique, generateNextInvoiceNumber } from '@/lib/store-electron'

const GENDERS: Gender[] = ['Male', 'Female', 'Other']

const TEST_TYPES: TestType[] = [
  'HBsAg',
  'HCV',
  'HIV',
  'MALARIA',
  'SYPHILIS',
  'Blood Sugar (Fasting)',
  'Blood Sugar (2 Hours After)',
  'Blood Sugar (Random)',
  'Blood Grouping',
]

const BLOOD_GROUPS: BloodGroup[] = ['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve']



interface PatientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
  onSave: () => void
}

export function PatientForm({ open, onOpenChange, patient, onSave }: PatientFormProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    name: '',
    age: '',
    gender: '' as Gender | '',
    phone: '',
    date: new Date(),
  })
  const [selectedTests, setSelectedTests] = useState<TestType[]>([])
  const [testResults, setTestResults] = useState<Record<string, TestResult | null>>({})
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('')
  const [customAmount, setCustomAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (patient) {
        setFormData({
          invoiceNumber: patient.invoiceNumber,
          name: patient.name,
          age: patient.age.toString(),
          gender: patient.gender,
          phone: patient.phone,
          date: new Date(patient.date),
        })
        setSelectedTests(patient.tests.map(t => t.test))
        const results: Record<string, TestResult | null> = {}
        let savedAmount = 0
        patient.tests.forEach(t => {
          results[t.test] = t.result
          if (t.test === 'Blood Grouping' && t.bloodGroup) {
            setBloodGroup(t.bloodGroup)
          }
        })
        setTestResults(results)
        setCustomAmount(patient.totalAmount?.toString() || '')
      } else {
        const loadNextInvoice = async () => {
          try {
            const nextInvoice = await generateNextInvoiceNumber()
            setFormData(prev => ({
              ...prev,
              invoiceNumber: nextInvoice,
              date: new Date(),
            }))
          } catch (error) {
            console.error('Failed to generate invoice number:', error)
            setFormData(prev => ({
              ...prev,
              invoiceNumber: '',
              date: new Date(),
            }))
          }
        }
        loadNextInvoice()
        
        setFormData(prev => ({
          ...prev,
          name: '',
          age: '',
          gender: '',
          phone: '',
        }))
        setSelectedTests([])
        setTestResults({})
        setBloodGroup('')
        setCustomAmount('')
      }
      setErrors({})
    }
  }, [open, patient])

  const validatePhone = (phone: string): boolean => {
    return /^\d{11}$/.test(phone)
  }

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required'
    } else {
      const isUnique = isInvoiceNumberUnique(formData.invoiceNumber, patient?.id)
      if (!isUnique) {
        newErrors.invoiceNumber = 'Invoice number already exists'
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required'
    }

    if (!formData.age || parseInt(formData.age) <= 0 || parseInt(formData.age) > 150) {
      newErrors.age = 'Valid age is required (1-150)'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 11 digits'
    }

    if (selectedTests.length === 0) {
      newErrors.tests = 'At least one test must be selected'
    }

    if (selectedTests.includes('Blood Grouping') && !bloodGroup) {
      newErrors.bloodGroup = 'Blood group must be selected'
    }

    // Validate all test results are filled
    for (const test of selectedTests) {
      if (test === 'Blood Grouping') continue
      if (!testResults[test]) {
        newErrors[`result_${test}`] = 'Result required'
      }
    }

    if (!customAmount || parseInt(customAmount) < 0) {
      newErrors.amount = 'Valid amount is required'
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
      const tests: TestEntry[] = selectedTests.map(test => ({
        test,
        result: testResults[test] || null,
        bloodGroup: test === 'Blood Grouping' ? bloodGroup as BloodGroup : undefined,
      }))

      const totalAmount = parseInt(customAmount) || 0

      const patientData: Patient = {
        id: patient?.id || uuidv4(),
        invoiceNumber: formData.invoiceNumber,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender as Gender,
        phone: formData.phone,
        date: format(formData.date, 'yyyy-MM-dd'),
        tests,
        totalAmount,
        createdAt: patient?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await savePatient(patientData)
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save patient:', error)
      setErrors({
        submit: 'Failed to save patient. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTest = (test: TestType) => {
    setSelectedTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    )
    if (!selectedTests.includes(test)) {
      setTestResults(prev => ({ ...prev, [test]: null }))
    }
  }

  const getResultOptions = (test: TestType): TestResult[] => {
    if (test === 'MALARIA') {
      return ['Reactive', 'Non Reactive']
    }
    return ['Positive', 'Negative']
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData(prev => ({ ...prev, invoiceNumber: value }))
                }}
                className={errors.invoiceNumber ? 'border-destructive' : ''}
                placeholder="Numbers only"
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-destructive">{errors.invoiceNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                  >
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
                        // Close popover by simulating escape key
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s.]/g, '')
                  setFormData(prev => ({ ...prev, name: value }))
                }}
                className={errors.name ? 'border-destructive' : ''}
                placeholder="Name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="150"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className={errors.age ? 'border-destructive' : ''}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
              >
                <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number * (11 digits)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setFormData(prev => ({ ...prev, phone: value }))
                }}
                placeholder="01XXXXXXXXX"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Test Selection */}
          <div className="space-y-3">
            <Label>Select Tests *</Label>
            {errors.tests && (
              <p className="text-sm text-destructive">{errors.tests}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEST_TYPES.map((test) => (
                <div
                  key={test}
                  className={cn(
                    'flex items-center space-x-2 rounded-lg border p-3 transition-colors',
                    selectedTests.includes(test) ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  )}
                >
                  <Checkbox
                    id={test}
                    checked={selectedTests.includes(test)}
                    onCheckedChange={() => toggleTest(test)}
                  />
                  <Label htmlFor={test} className="flex-1 cursor-pointer text-sm">
                    {test}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>
          {selectedTests.length > 0 && (
            <div className="space-y-3">
              <Label>Test Results *</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTests.map((test) => (
                  <div key={test} className="space-y-2 rounded-lg border p-3">
                    <Label className="text-sm font-medium">{test}</Label>
                    {test === 'Blood Grouping' ? (
                      <div className="space-y-2">
                        <Select
                          value={bloodGroup}
                          onValueChange={(value) => setBloodGroup(value as BloodGroup)}
                        >
                          <SelectTrigger className={errors.bloodGroup ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bloodGroup && (
                          <p className="text-sm text-destructive">{errors.bloodGroup}</p>
                        )}
                      </div>
                    ) : test.includes('Blood Sugar') ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Enter value"
                            value={testResults[test] || ''}
                            onChange={(e) => setTestResults(prev => ({ ...prev, [test]: e.target.value as TestResult }))}
                            className={errors[`result_${test}`] ? 'border-destructive' : ''}
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">mmol/L</span>
                        </div>
                        {errors[`result_${test}`] && (
                          <p className="text-sm text-destructive">{errors[`result_${test}`]}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Select
                          value={testResults[test] || ''}
                          onValueChange={(value) => setTestResults(prev => ({ ...prev, [test]: value as TestResult }))}
                        >
                          <SelectTrigger className={errors[`result_${test}`] ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            {getResultOptions(test).map((result) => (
                              <SelectItem key={result} value={result}>
                                {result}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`result_${test}`] && (
                          <p className="text-sm text-destructive">{errors[`result_${test}`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : patient ? 'Update Patient' : 'Add Patient'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
