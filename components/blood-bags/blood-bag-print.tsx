'use client'

import { useRef } from 'react'
import { format } from 'date-fns'
import { BloodBag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Printer } from 'lucide-react'

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
              margin-top: 1.5in;
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
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #1e3a5f;
            }
            .header h1 {
              margin: 0;
              font-size: 16pt;
            }
            .header h1 .sandhani {
              color: #dc2626;
            }
            .header p {
              margin: 4px 0 0;
              font-size: 9pt;
              color: #666;
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
            .result-item {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
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
            .cross-match {
              margin-top: 16px;
              padding: 12px;
              border: 2px solid #1e3a5f;
              border-radius: 8px;
              text-align: center;
            }
            .cross-match-label {
              font-weight: bold;
              font-size: 12pt;
            }
            .cross-match-value {
              font-size: 14pt;
              font-weight: bold;
              margin-top: 4px;
            }
            .cross-match-value.compatible {
              color: #16a34a;
            }
            .cross-match-value.incompatible {
              color: #dc2626;
            }
            .signature {
              margin-top: 40px;
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
          <div class="header">
            <h1><span class="sandhani">SANDHANI</span> Dhaka Dental College Unit</h1>
            <p>Developed by Dr. Shaikh Mahamudul Hasan, Former President, 2016-17 Session</p>
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
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Other Information</div>
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
              <div class="info-item">
                <span class="info-label">Place:</span>
                <span class="info-value">${bloodBag.place === 'Other' ? bloodBag.placeOther : bloodBag.place}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Department:</span>
                <span class="info-value">${bloodBag.department === 'Other' ? bloodBag.departmentOther : bloodBag.department}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Condition:</span>
                <span class="info-value">${bloodBag.condition}</span>
              </div>
            </div>
          </div>

          <div class="results">
            <h3 style="margin-bottom: 12px; color: #1e3a5f; font-size: 11pt;">Test Results</h3>
            ${bloodBag.tests.map(t => `
              <div class="result-item">
                <span class="result-label">${t.test}</span>
                <span class="result-value ${t.result === 'Positive' || t.result === 'Reactive' ? 'positive' : 'negative'}">
                  ${t.result || 'Pending'}
                </span>
              </div>
            `).join('')}
          </div>

          <div class="cross-match">
            <div class="cross-match-label">Cross Matching</div>
            <div class="cross-match-value ${bloodBag.crossMatch === 'Compatible' ? 'compatible' : 'incompatible'}">
              ${bloodBag.crossMatch}
            </div>
          </div>

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
          <DialogTitle className="flex items-center justify-between">
            <span>Print Preview - {bloodBag.invoiceNumber}</span>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="max-h-[60vh] overflow-y-auto rounded-lg border bg-white p-6">
          {/* Header */}
          <div className="mb-4 border-b-2 border-primary pb-3 text-center">
            <h1 className="text-lg font-bold">
              <span className="text-[oklch(0.55_0.22_25)]">SANDHANI</span>
              <span> Dhaka Dental College Unit</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Developed by Dr. Shaikh Mahamudul Hasan, Former President, 2016-17 Session
            </p>
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
                <div><strong>Blood Group:</strong> <span className="font-bold text-[oklch(0.55_0.22_25)]">{bloodBag.bloodGroup}</span></div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-[oklch(0.55_0.22_25)] p-3">
              <h3 className="mb-2 border-b pb-1 text-sm font-semibold text-[oklch(0.55_0.22_25)]">Donor Information</h3>
              <div className="space-y-1 text-xs">
                <div><strong>Name:</strong> {bloodBag.donorName}</div>
                <div><strong>Age:</strong> {bloodBag.donorAge} years</div>
                <div><strong>Gender:</strong> {bloodBag.donorGender}</div>
                <div><strong>Phone:</strong> {bloodBag.donorPhone}</div>
              </div>
            </div>
          </div>

          {/* Other Info */}
          <div className="mb-4 rounded-lg border p-3">
            <h3 className="mb-2 border-b pb-1 text-sm font-semibold">Other Information</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><strong>Invoice:</strong> {bloodBag.invoiceNumber}</div>
              <div><strong>Bag No:</strong> {bloodBag.bloodBagNumber}</div>
              <div><strong>Date:</strong> {format(new Date(bloodBag.date), 'dd/MM/yyyy')}</div>
              <div><strong>Place:</strong> {bloodBag.place === 'Other' ? bloodBag.placeOther : bloodBag.place}</div>
              <div><strong>Department:</strong> {bloodBag.department === 'Other' ? bloodBag.departmentOther : bloodBag.department}</div>
              <div><strong>Condition:</strong> {bloodBag.condition}</div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Test Results</h3>
            <div className="space-y-1">
              {bloodBag.tests.map((test, idx) => (
                <div key={idx} className="flex justify-between border-b border-dotted border-muted-foreground/30 py-1 text-xs">
                  <span className="font-medium">{test.test}</span>
                  <span className={test.result === 'Positive' || test.result === 'Reactive' ? 'font-semibold text-destructive' : 'font-semibold text-green-600'}>
                    {test.result || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross Match */}
          <div className="rounded-lg border-2 border-primary p-3 text-center">
            <div className="text-sm font-semibold">Cross Matching</div>
            <div className={`text-lg font-bold ${bloodBag.crossMatch === 'Compatible' ? 'text-green-600' : 'text-destructive'}`}>
              {bloodBag.crossMatch}
            </div>
          </div>

          {/* Signature */}
          <div className="mt-8 text-right">
            <div className="ml-auto w-40 border-t border-foreground pt-1 text-center text-xs">
              Signature
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
