import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BillingSaaS — Production Invoicing, Receipts & Financial Engine',
  description:
    'Multi-tenant billing, receipts, vendor payments, GST financial reports, dynamic UPI QR payments, and WhatsApp integration for modern businesses.',
  openGraph: {
    title: 'BillingSaaS — Multi-Tenant Invoicing & Accounting System',
    description:
      'Manage invoices, payments, expenses, capital ledger, and Indian FY financial reports with automated WhatsApp sharing and UPI payment QR codes.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillingSaaS',
    description: 'Multi-tenant billing, receipts, vendor payments, GST financial reports, and UPI QR payments.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  )
}
