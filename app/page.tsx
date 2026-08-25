import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Zap, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">BillingSaaS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold hover:text-primary transition-colors">
              Log In
            </Link>
            <Button asChild className="font-bold">
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
          
          <div className="container mx-auto px-4 relative text-center max-w-4xl space-y-8">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Designed for Indian SMBs & Enterprises
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Bill customers. <span className="text-primary">Track payments.</span> Know your profit.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate financial engine for your business. Generate GST-ready invoices, accept UPI payments, send WhatsApp receipts, and track your true net operating profit instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="h-12 px-8 font-bold text-base w-full sm:w-auto">
                <Link href="/register">
                  Start Your 14-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 font-bold text-base w-full sm:w-auto bg-background/50 backdrop-blur">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required. Cancel anytime.</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to run your business</h2>
              <p className="text-muted-foreground text-lg">Stop juggling spreadsheets. Unify your invoicing, expenses, and accounting in one powerful platform.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-2xl border shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Dynamic Invoicing</h3>
                <p className="text-muted-foreground leading-relaxed">Create professional bills with automated tax calculations, non-floating decimal accuracy, and PDF generation.</p>
              </div>
              
              <div className="bg-background p-8 rounded-2xl border shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">UPI & WhatsApp</h3>
                <p className="text-muted-foreground leading-relaxed">Print dynamic NPCI-compliant UPI QR codes on bills and send deep-link reminders directly to customers via WhatsApp.</p>
              </div>
              
              <div className="bg-background p-8 rounded-2xl border shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Financial Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">Real-time Profit & Loss statements separating operating revenue from capital ledger loans and overhead expenses.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Choose the plan that fits your business needs. Upgrade as you grow.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* STARTER */}
              <div className="bg-background border rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
                <div className="text-muted-foreground text-sm mb-6">Perfect for small freelancers</div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold tracking-tight">₹499</span>
                  <span className="text-muted-foreground font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Up to 100 Invoices/mo</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> 2 Team Members</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> WhatsApp Sharing</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Basic Reports</li>
                </ul>
                <Button variant="outline" className="w-full font-bold" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>

              {/* BUSINESS */}
              <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl flex flex-col relative scale-105 z-10 border-2 border-primary ring-4 ring-primary/20">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <div className="text-primary-foreground/80 text-sm mb-6">For growing SMBs & Agencies</div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold tracking-tight">₹1,299</span>
                  <span className="text-primary-foreground/80 font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-sm font-medium">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /> Up to 1,000 Invoices/mo</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /> 5 Team Members (RBAC)</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /> WhatsApp & UPI QR</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /> Advanced P&L Reports</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /> Capital Ledger</li>
                </ul>
                <Button variant="secondary" className="w-full font-bold text-primary" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>

              {/* PRO */}
              <div className="bg-background border rounded-3xl p-8 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-foreground mb-2">Pro</h3>
                <div className="text-muted-foreground text-sm mb-6">For large scale enterprises</div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold tracking-tight">₹2,499</span>
                  <span className="text-muted-foreground font-medium">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Unlimited Invoices</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Unlimited Team Members</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Custom Roles & Permissions</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> Priority Support</li>
                </ul>
                <Button variant="outline" className="w-full font-bold" asChild>
                  <Link href="/register">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-24 bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-muted" />
            <h2 className="text-3xl font-bold mb-6">Enterprise-Grade Security</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              Your financial data is protected by strict Multi-Tenant Row Level Security (RLS) policies, immutable audit trails, and bank-grade encryption protocols.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">BillingSaaS</span>
            </div>
            <p className="text-muted-foreground">Modern financial operating system for Indian businesses.</p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-primary">Log In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/refunds" className="hover:text-primary">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="mailto:support@billingsaas.com" className="hover:text-primary">Contact Us</a></li>
              <li>Help Center</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} BillingSaaS Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
