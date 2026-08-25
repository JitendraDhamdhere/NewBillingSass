import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const payload = await req.text()
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret'

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)

    // Bypass RLS in webhooks via Service Role Key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
      const subId = event.payload.subscription.entity.id
      const customerId = event.payload.subscription.entity.customer_id
      const currentEnd = event.payload.subscription.entity.current_end
      
      // Update subscription in DB
      await supabase
        .from('subscriptions')
        .update({
          status: 'ACTIVE',
          current_period_end: new Date(currentEnd * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subId)
    }

    if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
      const subId = event.payload.subscription.entity.id

      await supabase
        .from('subscriptions')
        .update({
          status: 'CANCELLED',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subId)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
