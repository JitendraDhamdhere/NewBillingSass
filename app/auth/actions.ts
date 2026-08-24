'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  error: string | null
  success: boolean
}

export async function login(state: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required', success: false }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(state: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required', success: false }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

export async function resetPassword(state: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required', success: false }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function createBusinessAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name) {
    return { error: 'Business name is required', success: false }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  // Insert business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({ name })
    .select()
    .single()

  if (businessError) {
    return { error: businessError.message, success: false }
  }

  // Insert membership as OWNER
  const { error: memberError } = await supabase.from('business_members').insert({
    business_id: business.id,
    user_id: user.id,
    role: 'OWNER',
  })

  if (memberError) {
    return { error: memberError.message, success: false }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
