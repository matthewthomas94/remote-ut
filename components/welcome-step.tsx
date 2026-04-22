"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Scenario } from "@/lib/scenarios"

interface WelcomeStepProps {
  onNext: (name: string, sessionId: string, scenario: Scenario) => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/session", { method: "POST" })
      if (!res.ok) throw new Error(`Session request failed: ${res.status}`)
      const data = (await res.json()) as { sessionId: string; scenario: Scenario }
      onNext(trimmed, data.sessionId, data.scenario)
    } catch (err) {
      console.error("[welcome] Failed to create session", err)
      setError("We couldn't start a session. Please check your connection and try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">User Testing Study</CardTitle>
          <CardDescription className="text-base mt-2">
            Welcome! Thank you for participating in our research study.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">What's your first name?</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="given-name"
                disabled={submitting}
                className="text-base"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={!name.trim() || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting session…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
