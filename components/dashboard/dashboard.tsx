'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfToday } from 'date-fns'
import { Calendar as CalendarIcon, Users, Droplets, TestTube, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getDashboardStats, getPatients, getBloodBags } from '@/lib/store'
import { BloodGroup } from '@/lib/types'

const BLOOD_GROUPS: BloodGroup[] = ['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve']

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  description
}: { 
  title: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'primary' | 'accent' | 'success'
  description?: string
}) {
  const bgClass = {
    default: 'bg-card',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-[oklch(0.55_0.22_25)] text-white',
    success: 'bg-[oklch(0.6_0.18_145)] text-white',
  }[variant]
  
  return (
    <Card className={cn('transition-shadow hover:shadow-md', bgClass)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
            )}>
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className={cn(
                'text-xs mt-1',
                variant === 'default' ? 'text-muted-foreground' : 'opacity-75'
              )}>
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <Icon className={cn(
              'h-8 w-8',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-75'
            )} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function BloodGroupCard({ group, count, variant = 'patient' }: { 
  group: string
  count: number
  variant?: 'patient' | 'bag'
}) {
  const isNegative = group.includes('-ve')
  
  return (
    <div className={cn(
      'rounded-lg border p-3 text-center transition-colors',
      isNegative 
        ? 'border-amber-200 bg-amber-50' 
        : 'border-primary/20 bg-primary/5'
    )}>
      <p className={cn(
        'text-lg font-bold',
        isNegative ? 'text-amber-700' : 'text-primary'
      )}>
        {group}
      </p>
      <p className="text-2xl font-bold text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground">
        {variant === 'patient' ? 'patients' : 'bags'}
      </p>
    </div>
  )
}

export function Dashboard() {
  const [fromDate, setFromDate] = useState<Date>(startOfToday())
  const [toDate, setToDate] = useState<Date>(startOfToday())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const stats = useMemo(() => {
    if (!isLoaded) return null
    return getDashboardStats(
      format(fromDate, 'yyyy-MM-dd'),
      format(toDate, 'yyyy-MM-dd')
    )
  }, [fromDate, toDate, isLoaded])

  if (!isLoaded || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time statistics and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(fromDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(date) => date && setFromDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-muted-foreground">to</span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(toDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(date) => date && setToDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
        />
        <StatCard 
          title="Total Blood Bags" 
          value={stats.totalBloodBags}
          icon={Droplets}
          variant="accent"
        />
        <StatCard 
          title="Total Tests" 
          value={Object.values(stats.testCounts).reduce((a, b) => a + b, 0)}
          icon={TestTube}
        />
        <StatCard 
          title="Total Amount" 
          value={`৳ ${stats.totalAmount.toLocaleString()}`}
          icon={Banknote}
          variant="success"
        />
      </div>

      {/* Patient Test Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Patient Test Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <StatCard title="HBsAg" value={stats.testCounts.HBsAg || 0} />
            <StatCard title="HCV" value={stats.testCounts.HCV || 0} />
            <StatCard title="HIV" value={stats.testCounts.HIV || 0} />
            <StatCard title="MALARIA" value={stats.testCounts.MALARIA || 0} />
            <StatCard title="SYPHILIS" value={stats.testCounts.SYPHILIS || 0} />
            <StatCard title="Blood Sugar" value={stats.testCounts['Blood Sugar'] || 0} />
            <StatCard title="Blood Grouping" value={Object.values(stats.bloodGroupCounts).reduce((a, b) => a + b, 0)} />
          </div>
        </CardContent>
      </Card>

      {/* Blood Group Statistics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Blood Group Statistics (Patients)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((group) => (
                <BloodGroupCard
                  key={group}
                  group={group}
                  count={stats.bloodGroupCounts[group] || 0}
                  variant="patient"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-[oklch(0.55_0.22_25)]" />
              Blood Donation Statistics (Bags)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((group) => (
                <BloodGroupCard
                  key={group}
                  group={group}
                  count={stats.bloodBagCounts[group] || 0}
                  variant="bag"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
