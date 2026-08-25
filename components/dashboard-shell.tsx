'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signout } from '@/app/auth/actions'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertTriangle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Building,
  LucideIcon,
  Tag,
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Invoices / Bills', href: '/dashboard/invoices', icon: FileText },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Services & Catalog', href: '/dashboard/services', icon: Tag },
  { name: 'Receipts', href: '/dashboard/receipts', icon: ArrowUpRight },
  { name: 'Payments', href: '/dashboard/payments', icon: ArrowDownLeft },
  { name: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
  { name: 'Capital Ledger', href: '/dashboard/capital-ledger', icon: Building },
  { name: 'Outstanding', href: '/dashboard/outstanding', icon: AlertTriangle },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Team & Security', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Building },
]

interface DashboardShellProps {
  children: React.ReactNode
  businessName: string
  userEmail: string
  userRole: string
}

export default function DashboardShell({
  children,
  businessName,
  userEmail,
  userRole,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground truncate max-w-[180px]">
            {businessName}
          </span>
        </div>
        <button
          type="button"
          className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-background p-6 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">{businessName}</span>
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col justify-between">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          'group flex gap-x-3 rounded-md p-2.5 text-sm font-semibold transition-all'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t pt-4">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {userEmail[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold truncate">{userEmail}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => signout()}
                  className="mt-2 group flex w-full gap-x-3 rounded-md p-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col border-r bg-background px-6 pb-4">
          <div className="flex h-16 items-center gap-2 border-b">
            <Building className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground text-lg truncate">{businessName}</span>
          </div>

          <nav className="mt-6 flex flex-1 flex-col justify-between">
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        'group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-all'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="relative border-t pt-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-3 px-2 py-1.5 w-full text-left rounded-md hover:bg-muted transition-all"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {userEmail[0].toUpperCase()}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-sm font-semibold truncate leading-tight">{userEmail}</p>
                    <p className="text-xs text-muted-foreground capitalize leading-none mt-1">
                      {userRole.toLowerCase()}
                    </p>
                  </div>
                </button>
              </div>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute bottom-16 right-0 left-0 z-20 mx-2 rounded-md bg-popover p-1 shadow-md border text-popover-foreground animate-in fade-in duration-100">
                    <button
                      onClick={() => signout()}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm text-destructive hover:bg-destructive/10 font-medium transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop Header & Content area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Desktop top header */}
        <header className="hidden lg:flex h-16 items-center justify-between border-b bg-background px-8 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {pathname === '/dashboard' ? 'Welcome Back!' : 'Billing Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary text-secondary-foreground border">
              Role: {userRole}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
