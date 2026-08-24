'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signup, type ActionState } from '@/app/auth/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const initialState: ActionState = {
  error: null,
  success: false,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    React.startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Get started by creating your user profile
          </CardDescription>
        </CardHeader>
        {state?.success ? (
          <CardContent className="space-y-4 py-6">
            <div className="rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-600 border border-emerald-500/20 text-center font-medium">
              Registration successful! Please check your email for confirmation, or proceed to{' '}
              <Link href="/login" className="underline font-bold text-emerald-700">
                login
              </Link>
              .
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {(state?.error || passwordError) && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 font-medium">
                  {state?.error || passwordError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@business.com"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="bg-background"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" loading={isPending}>
                Create Account
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
