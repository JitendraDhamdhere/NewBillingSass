import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { globalSearch } from '@/lib/services/report-service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'No business linked' }, { status: 400 })
  }

  const results = await globalSearch(membership.business_id, q)
  return NextResponse.json(results)
}
