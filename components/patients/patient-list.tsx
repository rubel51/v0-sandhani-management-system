'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Plus, Search, Edit2, Trash2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Patient } from '@/lib/types'
import { getPatients, deletePatient, searchPatients } from '@/lib/store-electron'
import { PatientForm } from './patient-form'
import { PatientPrint } from './patient-print'

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [printPatient, setPrintPatient] = useState<Patient | null>(null)

  const loadPatients = async () => {
    setIsLoading(true)
    try {
      const data = await getPatients()
      setPatients(data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
    setIsLoaded(true)
  }, [])

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients
    // Filter locally since searchPatients would be another DB call
    const lowerQuery = searchQuery.toLowerCase()
    return patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(searchQuery)
    )
  }, [patients, searchQuery])

  const handleEdit = (patient: Patient) => {
    setEditPatient(patient)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id)
      await loadPatients()
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete patient:', error)
    }
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditPatient(null)
    }
  }

  const handleSave = () => {
    loadPatients()
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading patients...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground">
            Manage patient records and test results
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, invoice number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="text-muted-foreground">
                      {searchQuery ? 'No patients found matching your search.' : 'No patients registered yet.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.age}y, {patient.gender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.tests.slice(0, 3).map((test, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {test.test.replace('Blood Sugar ', 'BS ')}
                          </Badge>
                        ))}
                        {patient.tests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.tests.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(patient.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(patient)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPrintPatient(patient)}
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(patient.id)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Form Dialog */}
      <PatientForm
        open={formOpen}
        onOpenChange={handleFormClose}
        patient={editPatient}
        onSave={handleSave}
      />

      {/* Print Dialog */}
      <PatientPrint
        open={!!printPatient}
        onOpenChange={(open) => !open && setPrintPatient(null)}
        patient={printPatient}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patient record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
