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
            .result-line {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 10pt;
            }
            .result-name {
              flex: 0 0 auto;
            }
            .result-dots {
              flex: 1 1 auto;
              text-align: center;
              padding: 0 8px;
              letter-spacing: 2px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .result-value {
              flex: 0 0 auto;
              text-align: right;
              min-width: 60px;
            }
            .result-value.positive {
              color: #dc2626;
              font-weight: 600;
            }
            .result-value.negative {
              color: #16a34a;
              font-weight: 600;
            }
            .cross-matching-box {
              border: 2px solid #dc2626;
              border-radius: 8px;
              padding: 12px;
              margin-top: 16px;
              text-align: center;
            }
            .cross-matching-label {
              font-weight: 600;
              color: #1e3a5f;
              font-size: 10pt;
            }
            .cross-matching-value {
              font-size: 12pt;
              font-weight: 700;
              color: #dc2626;
              margin-top: 4px;
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
          <div style="display: flex; gap: 16px; margin-bottom: 16px; padding: 8px; border-bottom: 1px solid #ddd;">
            <div><span style="font-weight: 600;">Invoice No:</span> ${bloodBag.invoiceNumber}</div>
            <div><span style="font-weight: 600;">Bag No:</span> ${bloodBag.bloodBagNumber}</div>
            <div><span style="font-weight: 600;">Date:</span> ${format(new Date(bloodBag.date), 'dd/MM/yyyy')}</div>
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
                <div class="info-item">
                  <span class="info-label">Hospital:</span>
                  <span class="info-value">${bloodBag.place}</span>
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
                  <span class="info-label">Blood Group:</span>
                  <span class="info-value" style="color: #dc2626; font-weight: bold;">${bloodBag.bloodGroup}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Condition:</span>
                  <span class="info-value">${bloodBag.condition}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="results">
            <div class="section-title">Test Results</div>
            ${bloodBag.tests.map(t => {
              const resultValue = t.result || 'Pending'
              const testName = t.test
              const dotCount = Math.max(1, 45 - testName.length - resultValue.length)
              const dots = '.'.repeat(dotCount)
              const isPositive = resultValue === 'Positive' || resultValue === 'Reactive'
              return `
                <div class="result-line">
                  <span class="result-name">${testName}</span>
                  <span class="result-dots">${dots}</span>
                  <span class="result-value ${isPositive ? 'positive' : 'negative'}">${resultValue}</span>
                </div>
              `
            }).join('')}
          </div>

          <div class="cross-matching-box">
            <div class="cross-matching-label">Cross Matching Result</div>
            <div class="cross-matching-value">${bloodBag.crossMatch}</div>
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
          <div className="mb-4 flex gap-4 border-b pb-2 text-xs">
            <div><strong>Invoice:</strong> {bloodBag.invoiceNumber}</div>
            <div><strong>Bag No:</strong> {bloodBag.bloodBagNumber}</div>
            <div><strong>Date:</strong> {format(new Date(bloodBag.date), 'dd/MM/yyyy')}</div>
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
                <div><strong>Hospital:</strong> {bloodBag.place}</div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-destructive p-3">
              <h3 className="mb-2 border-b pb-1 text-sm font-semibold text-destructive">Donor Information</h3>
              <div className="space-y-1 text-xs">
                <div><strong>Name:</strong> {bloodBag.donorName}</div>
                <div><strong>Age:</strong> {bloodBag.donorAge} years</div>
                <div><strong>Gender:</strong> {bloodBag.donorGender}</div>
                <div><strong>Phone:</strong> {bloodBag.donorPhone}</div>
                <div><strong>Blood Group:</strong> <span className="font-bold text-destructive">{bloodBag.bloodGroup}</span></div>
                <div><strong>Condition:</strong> {bloodBag.condition}</div>
              </div>
            </div>
          </div>

          {/* Test Results Pathology Format */}
          <div className="mb-4">
            <h4 className="mb-2 border-b pb-1 text-xs font-semibold">Test Results</h4>
            {bloodBag.tests.map((test, idx) => {
              const resultValue = test.result || 'Pending'
              return (
                <div key={idx} className="flex justify-between py-1 text-xs">
                  <span>{test.test}</span>
                  <span className="flex-1 border-b border-dotted border-foreground mx-2"></span>
                  <span className={`font-semibold ${resultValue === 'Positive' || resultValue === 'Reactive' ? 'text-destructive' : 'text-green-600'}`}>
                    {resultValue}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Cross Matching Box */}
          <div className="mb-4 rounded-lg border-2 border-destructive p-3 text-center">
            <div className="mb-1 text-xs font-semibold text-primary">Cross Matching Result</div>
            <div className="text-sm font-bold text-destructive">{bloodBag.crossMatch}</div>
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
