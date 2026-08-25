'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/validations/whatsapp'
import { Building, QrCode, MessageSquare, Check, AlertCircle } from 'lucide-react'

interface SettingsClientProps {
  business: any
  businessId: string
}

export default function SettingsClient({ business, businessId }: SettingsClientProps) {
  const supabase = createClient()

  const [name, setName] = useState(business.name || '')
  const [mobile, setMobile] = useState(business.mobile || '')
  const [whatsapp, setWhatsapp] = useState(business.whatsapp || '')
  const [email, setEmail] = useState(business.email || '')
  const [address, setAddress] = useState(business.address || '')
  const [upiId, setUpiId] = useState(business.upi_id || '')
  const [upiName, setUpiName] = useState(business.upi_name || business.name || '')

  const existingTemplates = business.whatsapp_templates || DEFAULT_WHATSAPP_TEMPLATES
  const [invoiceTpl, setInvoiceTpl] = useState(existingTemplates.invoice || DEFAULT_WHATSAPP_TEMPLATES.invoice)
  const [receiptTpl, setReceiptTpl] = useState(existingTemplates.receipt || DEFAULT_WHATSAPP_TEMPLATES.receipt)
  const [reminderTpl, setReminderTpl] = useState(existingTemplates.reminder || DEFAULT_WHATSAPP_TEMPLATES.reminder)
  const [statementTpl, setStatementTpl] = useState(existingTemplates.statement || DEFAULT_WHATSAPP_TEMPLATES.statement)

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    const updatedTemplates = {
      invoice: invoiceTpl,
      receipt: receiptTpl,
      reminder: reminderTpl,
      statement: statementTpl,
    }

    const { error } = await supabase
      .from('businesses')
      .update({
        name,
        mobile,
        whatsapp,
        email,
        address,
        upi_id: upiId,
        upi_name: upiName,
        whatsapp_templates: updatedTemplates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Business profile, UPI VPA, and WhatsApp templates updated successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Business Settings & Integration Profile</h2>
          <p className="text-sm text-muted-foreground">Configure business branding, UPI VPA for payment QR codes, and WhatsApp sharing templates.</p>
        </div>
        
        <Button variant="outline" asChild className="font-bold shrink-0">
          <a href="/dashboard/settings/billing">Manage Billing & Subscription</a>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded border border-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded border border-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. BUSINESS BRANDING */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" /> Business Profile & Branding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <Label htmlFor="b-name">Business Name *</Label>
              <Input id="b-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="b-mobile">Phone / Mobile</Label>
              <Input id="b-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="b-wa">WhatsApp Contact Number</Label>
              <Input id="b-wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 9876543210" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="b-email">Email Address</Label>
              <Input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <Label htmlFor="b-addr">Business Address</Label>
            <textarea
              id="b-addr"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded text-xs bg-background"
              placeholder="Full shop / office address"
            />
          </div>
        </Card>

        {/* 2. DYNAMIC UPI VPA PAYMENT SETTINGS */}
        <Card className="p-6 space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Dynamic UPI Payment QR Code Setup
            </h3>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded">
              NPCI Standard
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Configure your business VPA (UPI ID) to automatically print dynamic payment QR codes on invoices. scanned via GPay, PhonePe, or Paytm.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <Label htmlFor="upi-id">Business UPI VPA / UPI ID *</Label>
              <Input
                id="upi-id"
                placeholder="e.g. 9876543210@upi or business@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Appears in dynamic QR codes encoding exact invoice balance due.</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="upi-name">UPI Payee Name</Label>
              <Input
                id="upi-name"
                placeholder="e.g. Shree Enterprise"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Name displayed to customer in UPI app.</p>
            </div>
          </div>
        </Card>

        {/* 3. WHATSAPP TEMPLATES */}
        <Card className="p-6 space-y-4 border-l-4 border-l-emerald-500">
          <h3 className="font-bold text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> WhatsApp Message Templates
          </h3>
          <p className="text-xs text-muted-foreground">
            Customize the templated text sent to customers. Available variables: <code className="bg-muted px-1 rounded">{'{customer_name}'}</code>, <code className="bg-muted px-1 rounded">{'{invoice_number}'}</code>, <code className="bg-muted px-1 rounded">{'{amount}'}</code>, <code className="bg-muted px-1 rounded">{'{due_amount}'}</code>, <code className="bg-muted px-1 rounded">{'{due_date}'}</code>, <code className="bg-muted px-1 rounded">{'{upi_id}'}</code>.
          </p>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label>Invoice Sharing Template</Label>
              <textarea
                rows={3}
                value={invoiceTpl}
                onChange={(e) => setInvoiceTpl(e.target.value)}
                className="w-full p-2 border rounded font-mono text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label>Receipt Confirmation Template</Label>
              <textarea
                rows={3}
                value={receiptTpl}
                onChange={(e) => setReceiptTpl(e.target.value)}
                className="w-full p-2 border rounded font-mono text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label>Payment Due Reminder Template</Label>
              <textarea
                rows={3}
                value={reminderTpl}
                onChange={(e) => setReminderTpl(e.target.value)}
                className="w-full p-2 border rounded font-mono text-xs bg-background"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="px-6 font-bold">
            {loading ? 'Saving Settings...' : 'Save Settings & Integration Profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
