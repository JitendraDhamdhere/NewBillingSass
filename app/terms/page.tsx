import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using BillingSaaS, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2>2. Description of Service</h2>
          <p>BillingSaaS provides businesses with invoicing, expense tracking, UPI QR generation, and financial reporting tools via a Software-as-a-Service model.</p>
          
          <h2>3. Subscriptions & Billing</h2>
          <p>Some parts of the Service are billed on a subscription basis ("Paid Subscriptions"). You will be billed in advance on a recurring and periodic basis. Depending on the subscription plan you choose, your usage limits (e.g., invoices per month, team members) will be enforced.</p>
          
          <h2>4. Data Accuracy</h2>
          <p>You are responsible for the accuracy of the financial data entered into the system. BillingSaaS is not liable for taxation or accounting errors resulting from user input.</p>
          
          <h2>5. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </div>
    </div>
  )
}
