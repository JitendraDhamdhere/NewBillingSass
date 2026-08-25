import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-3xl space-y-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This includes billing information, business details, and transactional data.</p>
          
          <h2>2. Use of Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, such as facilitating payments, sending receipts, and providing financial analytics.</p>
          
          <h2>3. Data Security & Multi-Tenant Isolation</h2>
          <p>Your financial data is protected by strict Multi-Tenant Row Level Security (RLS) policies. We employ bank-grade encryption to ensure that your business data is completely isolated and invisible to other tenants on the platform.</p>
          
          <h2>4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. If your subscription expires, your data is not immediately deleted, allowing you to reactivate your account without data loss.</p>
          
          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@billingsaas.com.</p>
        </div>
      </div>
    </div>
  )
}
