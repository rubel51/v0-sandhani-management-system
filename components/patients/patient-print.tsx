'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { Patient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Printer } from 'lucide-react'

interface PatientPrintProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
}

export function PatientPrint({ open, onOpenChange, patient }: PatientPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!patient) return null

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const bloodGroupTest = patient.tests.find(t => t.test === 'Blood Grouping')
    const hasBloodGroup = bloodGroupTest && bloodGroupTest.bloodGroup

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Report - ${patient.invoiceNumber}</title>
          <style>
            @page {
              margin-top: 1.5in;
              margin-bottom: 0.5in;
              margin-left: 0.5in;
              margin-right: 0.5in;
              size: A4;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #1a1a1a;
            }
            .page {
              page-break-after: always;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 2px solid #1e3a5f;
            }
            .header h1 {
              margin: 0;
              font-size: 18pt;
            }
            .header h1 .sandhani {
              color: #dc2626;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 10pt;
              color: #666;
            }
            .info-box {
              border: 2px solid #1e3a5f;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
            }
            .info-item {
              display: flex;
            }
            .info-label {
              font-weight: 600;
              min-width: 100px;
            }
            .results {
              margin-top: 24px;
            }
            .result-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .result-item:last-child {
              border-bottom: none;
            }
            .result-label {
              font-weight: 500;
            }
            .result-value {
              font-weight: 600;
            }
            .result-value.positive {
              color: #dc2626;
            }
            .result-value.negative {
              color: #16a34a;
            }
            .signature {
              margin-top: 60px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px solid #1a1a1a;
              width: 200px;
              margin-left: auto;
              padding-top: 4px;
              text-align: center;
            }
            .blood-group-page {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              text-align: center;
            }
            .blood-group-display {
              border: 4px solid #dc2626;
              border-radius: 16px;
              padding: 40px 60px;
              margin: 24px 0;
            }
            .blood-group-display .group {
              font-size: 72pt;
              font-weight: bold;
              color: #dc2626;
              line-height: 1;
            }
            .blood-group-display .rh {
              font-size: 36pt;
              font-weight: bold;
              color: #1e3a5f;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1><span class="sandhani">SANDHANI</span> Dhaka Dental College Unit</h1>
              <p>Developed by Dr. Shaikh Mahamudul Hasan, Former President, 2016-17 Session</p>
            </div>
            
            <div class="info-box">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Invoice No:</span>
                  <span>${patient.invoiceNumber}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span>
                  <span>${format(new Date(patient.date), 'dd/MM/yyyy')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span>${patient.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Age:</span>
                  <span>${patient.age} years</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender:</span>
                  <span>${patient.gender}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span>${patient.phone}</span>
                </div>
              </div>
            </div>

            <div class="results">
              <h3 style="margin-bottom: 16px; color: #1e3a5f;">Test Results</h3>
              ${patient.tests
                .filter(t => t.test !== 'Blood Grouping')
                .map(t => `
                  <div class="result-item">
                    <span class="result-label">${t.test}</span>
                    <span class="result-value ${t.result === 'Positive' || t.result === 'Reactive' ? 'positive' : 'negative'}">
                      ${t.result || 'Pending'}
                    </span>
                  </div>
                `).join('')}
            </div>

            <div class="signature">
              <div class="signature-line">Signature</div>
            </div>
          </div>

          ${hasBloodGroup ? `
            <div class="page">
              <div class="header">
                <h1><span class="sandhani">SANDHANI</span> Dhaka Dental College Unit</h1>
                <p>Blood Group Report</p>
              </div>
              
              <div class="info-box">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span>${patient.name}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date:</span>
                    <span>${format(new Date(patient.date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>

              <div class="blood-group-page">
                <h2>Blood Group</h2>
                <div class="blood-group-display">
                  <div class="group">${bloodGroupTest?.bloodGroup?.split(' ')[0]}</div>
                  <div class="rh">${bloodGroupTest?.bloodGroup?.split(' ')[1]}</div>
                </div>
              </div>

              <div class="signature">
                <div class="signature-line">Signature</div>
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Print Preview - {patient.invoiceNumber}</span>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="rounded-lg border bg-white p-6">
          {/* Header */}
          <div className="mb-6 border-b-2 border-primary pb-4 text-center">
            <h1 className="text-xl font-bold">
              <span className="text-[oklch(0.55_0.22_25)]">SANDHANI</span>
              <span> Dhaka Dental College Unit</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Developed by Dr. Shaikh Mahamudul Hasan, Former President, 2016-17 Session
            </p>
          </div>

          {/* Patient Info Box */}
          <div className="mb-6 rounded-lg border-2 border-primary p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Invoice No:</strong> {patient.invoiceNumber}</div>
              <div><strong>Date:</strong> {format(new Date(patient.date), 'dd/MM/yyyy')}</div>
              <div><strong>Name:</strong> {patient.name}</div>
              <div><strong>Age:</strong> {patient.age} years</div>
              <div><strong>Gender:</strong> {patient.gender}</div>
              <div><strong>Phone:</strong> {patient.phone}</div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h3 className="mb-4 font-semibold text-primary">Test Results</h3>
            <div className="space-y-2">
              {patient.tests.filter(t => t.test !== 'Blood Grouping').map((test, idx) => (
                <div key={idx} className="flex justify-between border-b border-dotted border-muted-foreground/30 py-2">
                  <span className="font-medium">{test.test}</span>
                  <span className={test.result === 'Positive' || test.result === 'Reactive' ? 'font-semibold text-destructive' : 'font-semibold text-green-600'}>
                    {test.result || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Group if exists */}
          {patient.tests.find(t => t.test === 'Blood Grouping')?.bloodGroup && (
            <div className="mt-6 rounded-lg border-2 border-[oklch(0.55_0.22_25)] p-4 text-center">
              <h3 className="mb-2 font-semibold">Blood Group</h3>
              <p className="text-3xl font-bold text-[oklch(0.55_0.22_25)]">
                {patient.tests.find(t => t.test === 'Blood Grouping')?.bloodGroup}
              </p>
            </div>
          )}

          {/* Signature */}
          <div className="mt-12 text-right">
            <div className="ml-auto w-48 border-t border-foreground pt-1 text-center text-sm">
              Signature
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
