'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { createBusinessAction, signout, type ActionState } from '@/app/auth/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const initialState: ActionState = {
  error: null,
  success: false,
}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(createBusinessAction, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Set up your business
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create a business profile to start managing bills and payments
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 font-medium">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Acme Retail, Crosonic Tech"
                className="bg-background"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" loading={isPending}>
              Create Workspace & Continue
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => signout()}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground hover:underline"
              >
                Sign out
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
