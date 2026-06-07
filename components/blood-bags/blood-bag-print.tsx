'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'
import { BloodBag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BloodBagPrintProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bloodBag: BloodBag | null
}

export function BloodBagPrint({ open, onOpenChange, bloodBag }: BloodBagPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!bloodBag) return null

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blood Bag Report - ${bloodBag.invoiceNumber}</title>
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
              font-size: 11pt;
              line-height: 1.4;
              color: #1a1a1a;
            }
            .section {
              border: 2px solid #1e3a5f;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 16px;
            }
            .section-title {
              font-size: 11pt;
              font-weight: bold;
              color: #1e3a5f;
              margin-bottom: 8px;
              padding-bottom: 4px;
              border-bottom: 1px solid #ddd;
            }
            .section-title.red {
              color: #dc2626;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 16px;
            }
            .info-item {
              display: flex;
            }
            .info-label {
              font-weight: 600;
              min-width: 90px;
              font-size: 10pt;
            }
            .info-value {
              font-size: 10pt;
            }
            .results {
              margin-top: 16px;
            }
            .result-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            .result-table th {
              background-color: #f0f0f0;
              border: 1px solid #1e3a5f;
              padding: 6px;
              text-align: left;
              font-weight: 600;
              font-size: 10pt;
            }
            .result-table td {
              border: 1px solid #1e3a5f;
              padding: 6px;
              font-size: 10pt;
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
              margin-top: 160px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px solid #1a1a1a;
              width: 180px;
              margin-left: auto;
              padding-top: 4px;
              text-align: center;
              font-size: 10pt;
            }
          </style>
        </head>
        <body>
          <div class="section">
            <div class="section-title">Invoice & Date Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Invoice No:</span>
                <span class="info-value">${bloodBag.invoiceNumber}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Bag No:</span>
                <span class="info-value">${bloodBag.bloodBagNumber}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">${format(new Date(bloodBag.date), 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div class="section">
              <div class="section-title">Patient Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${bloodBag.patientName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Age:</span>
                  <span class="info-value">${bloodBag.patientAge} years</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender:</span>
                  <span class="info-value">${bloodBag.patientGender}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${bloodBag.patientPhone}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Blood Group:</span>
                  <span class="info-value" style="color: #dc2626; font-weight: bold;">${bloodBag.bloodGroup}</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title red">Donor Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${bloodBag.donorName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Age:</span>
                  <span class="info-value">${bloodBag.donorAge} years</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender:</span>
                  <span class="info-value">${bloodBag.donorGender}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${bloodBag.donorPhone}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Condition:</span>
                  <span class="info-value">${bloodBag.condition}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="results">
            <table class="result-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                ${bloodBag.tests.map(t => `
                  <tr>
                    <td>${t.test}</td>
                    <td class="result-value ${t.result === 'Positive' || t.result === 'Reactive' ? 'positive' : 'negative'}">
                      ${t.result || 'Pending'}
                    </td>
                  </tr>
                `).join('')}
                <tr>
                  <td><strong>Cross Matching</strong></td>
                  <td class="result-value ${bloodBag.crossMatch === 'Compatible' ? 'negative' : 'positive'}">
                    ${bloodBag.crossMatch}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="signature">
            <div class="signature-line">Signature</div>
          </div>
        </body>

          <div class="signature">
            <div class="signature-line">Signature</div>
          </div>
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
            <span>Print Preview - {bloodBag.invoiceNumber}</span>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="max-h-[60vh] overflow-y-auto rounded-lg border bg-white p-6 text-sm">
          {/* Invoice & Date */}
          <div className="mb-4 rounded-lg border p-3">
            <h3 className="mb-2 border-b pb-1 font-semibold">Invoice & Date Information</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><strong>Invoice:</strong> {bloodBag.invoiceNumber}</div>
              <div><strong>Bag No:</strong> {bloodBag.bloodBagNumber}</div>
              <div><strong>Date:</strong> {format(new Date(bloodBag.date), 'dd/MM/yyyy')}</div>
            </div>
          </div>

          {/* Patient & Donor Info */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-primary p-3">
              <h3 className="mb-2 border-b pb-1 text-sm font-semibold text-primary">Patient Information</h3>
              <div className="space-y-1 text-xs">
                <div><strong>Name:</strong> {bloodBag.patientName}</div>
                <div><strong>Age:</strong> {bloodBag.patientAge} years</div>
                <div><strong>Gender:</strong> {bloodBag.patientGender}</div>
                <div><strong>Phone:</strong> {bloodBag.patientPhone}</div>
                <div><strong>Blood Group:</strong> <span className="font-bold text-destructive">{bloodBag.bloodGroup}</span></div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-destructive p-3">
              <h3 className="mb-2 border-b pb-1 text-sm font-semibold text-destructive">Donor Information</h3>
              <div className="space-y-1 text-xs">
                <div><strong>Name:</strong> {bloodBag.donorName}</div>
                <div><strong>Age:</strong> {bloodBag.donorAge} years</div>
                <div><strong>Gender:</strong> {bloodBag.donorGender}</div>
                <div><strong>Phone:</strong> {bloodBag.donorPhone}</div>
                <div><strong>Condition:</strong> {bloodBag.condition}</div>
              </div>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-primary bg-gray-100 p-2 text-left text-xs font-semibold">Test Name</th>
                  <th className="border border-primary bg-gray-100 p-2 text-left text-xs font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {bloodBag.tests.map((test, idx) => (
                  <tr key={idx}>
                    <td className="border border-primary p-2 text-xs">{test.test}</td>
                    <td className={`border border-primary p-2 text-xs font-semibold ${test.result === 'Positive' || test.result === 'Reactive' ? 'text-destructive' : 'text-green-600'}`}>
                      {test.result || 'Pending'}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-primary p-2 text-xs font-semibold">Cross Matching</td>
                  <td className={`border border-primary p-2 text-xs font-semibold ${bloodBag.crossMatch === 'Compatible' ? 'text-green-600' : 'text-destructive'}`}>
                    {bloodBag.crossMatch}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature */}
          <div className="mt-32 text-right">
            <div className="ml-auto w-40 border-t border-foreground pt-1 text-center text-xs">
              Signature
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
