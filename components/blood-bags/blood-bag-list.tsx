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
import { BloodBag } from '@/lib/types'
import { getBloodBags, deleteBloodBag, searchBloodBags } from '@/lib/store'
import { BloodBagForm } from './blood-bag-form'
import { BloodBagPrint } from './blood-bag-print'

export function BloodBagList() {
  const [bloodBags, setBloodBags] = useState<BloodBag[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editBloodBag, setEditBloodBag] = useState<BloodBag | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [printBloodBag, setPrintBloodBag] = useState<BloodBag | null>(null)

  const loadBloodBags = () => {
    setBloodBags(getBloodBags())
  }

  useEffect(() => {
    loadBloodBags()
    setIsLoaded(true)
  }, [])

  const filteredBloodBags = useMemo(() => {
    if (!searchQuery.trim()) return bloodBags
    return searchBloodBags(searchQuery)
  }, [bloodBags, searchQuery])

  const handleEdit = (bloodBag: BloodBag) => {
    setEditBloodBag(bloodBag)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteBloodBag(id)
    loadBloodBags()
    setDeleteId(null)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditBloodBag(null)
    }
  }

  const handleSave = () => {
    loadBloodBags()
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading blood bags...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blood Bags</h2>
          <p className="text-muted-foreground">
            Manage blood bag records and donor information
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Blood Bag
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Blood Bags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, invoice number, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blood Bag Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Cross Match</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBloodBags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="text-muted-foreground">
                      {searchQuery ? 'No blood bags found matching your search.' : 'No blood bags registered yet.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBloodBags.map((bloodBag) => (
                  <TableRow key={bloodBag.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bloodBag.invoiceNumber}</div>
                        <div className="text-xs text-muted-foreground">Bag: {bloodBag.bloodBagNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bloodBag.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {bloodBag.patientAge}y, {bloodBag.patientGender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bloodBag.donorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {bloodBag.donorAge}y, {bloodBag.donorGender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[oklch(0.55_0.22_25)] text-[oklch(0.55_0.22_25)]">
                        {bloodBag.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={bloodBag.crossMatch === 'Compatible' ? 'default' : 'destructive'}
                        className={bloodBag.crossMatch === 'Compatible' ? 'bg-green-600' : ''}
                      >
                        {bloodBag.crossMatch}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(bloodBag.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bloodBag)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPrintBloodBag(bloodBag)}
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(bloodBag.id)}
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

      {/* Blood Bag Form Dialog */}
      <BloodBagForm
        open={formOpen}
        onOpenChange={handleFormClose}
        bloodBag={editBloodBag}
        onSave={handleSave}
      />

      {/* Print Dialog */}
      <BloodBagPrint
        open={!!printBloodBag}
        onOpenChange={(open) => !open && setPrintBloodBag(null)}
        bloodBag={printBloodBag}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blood Bag Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blood bag record? This action cannot be undone.
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
