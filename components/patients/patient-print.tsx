'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'
import { Patient } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
              margin-top: 2in;
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
            .result-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            .result-table th {
              background-color: #f0f0f0;
              border: 1px solid #1e3a5f;
              padding: 8px;
              text-align: left;
              font-weight: 600;
            }
            .result-table td {
              border: 1px solid #1e3a5f;
              padding: 8px;
            }
            .result-value.positive {
              color: #dc2626;
              font-weight: 600;
            }
            .result-value.negative {
              color: #16a34a;
              font-weight: 600;
            }
            .signature {
              margin-top: 220px;
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
              margin-top: 24px;
            }
            .blood-group-page h2 {
              text-align: center;
              font-size: 18pt;
              color: #1e3a5f;
              margin-bottom: 24px;
              border-bottom: 2px solid #1e3a5f;
              padding-bottom: 12px;
            }
            .blood-group-result {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px dotted #ccc;
              font-size: 14pt;
            }
            .blood-group-result:last-child {
              border-bottom: none;
            }
            .blood-group-label {
              font-weight: 500;
            }
            .blood-group-value {
              font-weight: 700;
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="page">
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

            <h2 style="text-align: center; font-size: 18pt; color: #1e3a5f; margin: 24px 0;">Test Report</h2>

            <div class="results">
              <table class="result-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${patient.tests
                    .filter(t => t.test !== 'Blood Grouping')
                    .map(t => `
                      <tr>
                        <td>${t.test}</td>
                        <td class="result-value ${t.result === 'Positive' || t.result === 'Reactive' ? 'positive' : 'negative'}">
                          ${t.result || 'Pending'}
                        </td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>

            <div class="signature">
              <div class="signature-line">Signature</div>
            </div>
          </div>

          ${hasBloodGroup ? `
            <div class="page">
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



              <div class="blood-group-page">
                <div class="blood-group-result">
                  <span class="blood-group-label">Blood Group..................................................</span>
                  <span class="blood-group-value">${bloodGroupTest?.bloodGroup?.split(' ')[0]}</span>
                </div>
                <div class="blood-group-result">
                  <span class="blood-group-label">Rh Factor......................................................</span>
                  <span class="blood-group-value">${bloodGroupTest?.bloodGroup?.split(' ')[1]}</span>
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
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Print Preview - {patient.invoiceNumber}</span>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="rounded-lg border bg-white p-6">
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

          {/* Test Report Heading */}
          <h2 className="mb-6 text-center text-xl font-bold text-primary">Test Report</h2>

          {/* Test Results Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-primary bg-gray-100 p-2 text-left font-semibold">Test Name</th>
                  <th className="border border-primary bg-gray-100 p-2 text-left font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {patient.tests.filter(t => t.test !== 'Blood Grouping').map((test, idx) => (
                  <tr key={idx}>
                    <td className="border border-primary p-2">{test.test}</td>
                    <td className={`border border-primary p-2 font-semibold ${test.result === 'Positive' || test.result === 'Reactive' ? 'text-destructive' : 'text-green-600'}`}>
                      {test.result || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature */}
          <div className="mt-24 text-right">
            <div className="ml-auto w-48 border-t border-foreground pt-1 text-center text-sm">
              Signature
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
