'use client'

import { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSettings, saveSettings } from '@/lib/store'
import { Settings as SettingsType } from '@/lib/types'

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType>({
    bloodBagNumberSuffix: '',
  })
  const [saved, setSaved] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
    setIsLoaded(true)
  }, [])

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure application settings and preferences
        </p>
      </div>

      {/* Blood Bag Number Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Bag Number Settings</CardTitle>
          <CardDescription>
            Configure how blood bag numbers are generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suffix">Blood Bag Number Suffix</Label>
            <Input
              id="suffix"
              value={settings.bloodBagNumberSuffix}
              onChange={(e) => setSettings(prev => ({ ...prev, bloodBagNumberSuffix: e.target.value }))}
              placeholder="e.g., A, B, BB"
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              This suffix will be appended to blood bag numbers.
              <br />
              Example: If suffix is &quot;A&quot;, blood bag number will be &quot;123/A&quot;
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold">
              <span className="text-[oklch(0.55_0.22_25)]">SANDHANI</span> Dhaka Dental College Unit
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Medical Management System - Blood Bank &amp; Pathology
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Developed by Dr. Shaikh Mahamudul Hasan
              <br />
              Former President, 2016-17 Session
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Features:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Patient registration and test management</li>
              <li>Blood bag tracking and donor management</li>
              <li>Professional report printing</li>
              <li>Dashboard with real-time statistics</li>
              <li>Date range filtering for reports</li>
              <li>Local data storage (works offline)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Information</CardTitle>
          <CardDescription>
            All data is stored locally in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Important:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Data is stored in your browser&apos;s local storage</li>
              <li>Clearing browser data will delete all records</li>
              <li>Data is specific to this browser and device</li>
              <li>Consider regularly exporting important data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
