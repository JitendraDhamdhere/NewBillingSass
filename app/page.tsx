import * as React from 'react'
import Link from 'next/link'
import {
  Building2,
  CheckCircle,
  FileText,
  ShieldCheck,
  Zap,
  TrendingUp,
  Smartphone,
  MessageSquare,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              VyaapaarBill
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span>Slick, fast accounting for Indian small businesses</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Bill Customers. Track Payments. <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Know Your Profit.
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A billing, receipts, payments, and outstanding management SaaS that takes just 15
              seconds to perform any action.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-input bg-background px-8 py-3 text-base font-semibold hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 border-t">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Everything you need to manage business cashflow
              </h2>
              <p className="mt-4 text-muted-foreground">
                Simplify your day-to-day operation with tools built specifically for speed.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">Fast Invoicing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create compliant GST and non-GST invoices in under 15 seconds. Share via WhatsApp.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <TrendingUp className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">Outstanding Ledger</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Know exactly who owes you money and send direct payment reminders in one click.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Smartphone className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">Mobile First UX</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Full capabilities on mobile layout for active business owners who are always on the move.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">Tenant Isolation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Strict Row Level Security guarantees your client data is completely hidden from other users.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <MessageSquare className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">WhatsApp & UPI Integration</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Print invoices, generate dynamic UPI payment QRs, and automate message alerts.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Building2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold">Multi-Member Roles</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Define roles for Owner, Accountant, and Staff with granular permission policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 border-t bg-muted/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Choose the best workspace setup for your business scale.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Starter Plan */}
              <div className="rounded-xl border bg-card p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold">Basic Vyaapaari</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ideal for individual merchants and small retail shops.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      ₹499
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {['Unlimited Bills', 'Basic Ledger Management', '1 Business Workspace', 'WhatsApp Sharing'].map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="block text-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="rounded-xl border-2 border-primary bg-card p-8 shadow-md flex flex-col justify-between relative">
                <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Popular
                </div>
                <div>
                  <h3 className="text-lg font-bold">Vyapaar Pro</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Perfect for fast-growing businesses needing team access.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      ₹999
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {[
                      'Everything in Basic',
                      'Multi-User Roles (Staff, Accountant)',
                      'GST Report Exports',
                      'Dynamic UPI QRs',
                      'Priority Support',
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="block text-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">VyaapaarBill</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VyaapaarBill Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
