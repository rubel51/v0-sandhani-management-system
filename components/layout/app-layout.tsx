'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Droplet, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/blood-bags', label: 'Blood Bag', icon: Droplet },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppHeader() {
  return (
    <header className="no-print sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="flex h-20 items-center gap-6 px-6">
        <div className="flex items-center gap-4">
          <Image
            src="/slogo.png"
            alt="Sandhani Logo"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-[oklch(0.55_0.22_25)]">SANDHANI</span>
            <span className="text-foreground"> Dhaka Dental College Unit</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Developed by Dr. Shaikh Mahamudul Hasan, Former President, 2016-17 Session
          </p>
        </div>
      </div>
    </header>
  )
}

export function AppNav() {
  const pathname = usePathname()
  
  return (
    <nav className="no-print sticky top-20 z-40 w-full border-b bg-sidebar">
      <div className="flex items-center gap-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
