import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Refund & Cancellation Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Free Trial</h2>
          <p>We offer a 14-day free trial for new users to evaluate the platform. No credit card is required to start the trial.</p>
          
          <h2>2. Subscription Cancellations</h2>
          <p>You can cancel your subscription at any time through your dashboard billing settings. When you cancel, your subscription will remain active until the end of your current billing cycle.</p>
          
          <h2>3. Refunds</h2>
          <p>Refunds are evaluated on a case-by-case basis. Generally, payments for recurring subscriptions are non-refundable. If you experience technical issues that prevent you from using the service, please contact support within 7 days of your charge.</p>
          
          <h2>4. Data Export</h2>
          <p>Upon cancellation, your data will be retained in a read-only state. You can export your data to CSV formats at any time before or after cancellation.</p>
        </div>
      </div>
    </div>
  )
}
