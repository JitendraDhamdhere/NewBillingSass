'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { resetPassword, type ActionState } from '@/app/auth/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const initialState: ActionState = {
  error: null,
  success: false,
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Reset password
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email and we&apos;ll send you a password reset link
          </CardDescription>
        </CardHeader>
        {state?.success ? (
          <CardContent className="space-y-4 py-6">
            <div className="rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-600 border border-emerald-500/20 text-center font-medium">
              Password reset link sent! Please check your email inbox. Proceed to{' '}
              <Link href="/login" className="underline font-bold text-emerald-700">
                login
              </Link>
              .
            </div>
          </CardContent>
        ) : (
          <form action={formAction}>
            <CardContent className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 font-medium">
                  {state.error}
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" loading={isPending}>
                Send Reset Link
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
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
