"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { PRIMING_CHECK_QUESTION, SCENARIO_COPY, type Scenario } from "@/lib/scenarios"

interface PrimingStepProps {
  scenario: Scenario
  onNext: (primingCheck: string) => Promise<void> | void
  recordingError: string | null
}

export function PrimingStep({ scenario, onNext, recordingError }: PrimingStepProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const copy = SCENARIO_COPY[scenario]
  const canContinue = answer.trim().length > 0 && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canContinue) return
    setSubmitting(true)
    try {
      await onNext(answer.trim())
    } finally {
      // If getDisplayMedia rejected, onNext returns but step stays on 3,
      // so re-enable the button for a retry.
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your scenario</CardTitle>
          <CardDescription className="text-base mt-2">
            Read the scenario below, then tell us in your own words what you've been asked to do.
            When you continue, you'll be asked to share your screen — this is required for the test.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border bg-muted/40 p-5 text-[15px] leading-relaxed whitespace-pre-line">
            {copy.body}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="primingCheck" className="text-base">
                {PRIMING_CHECK_QUESTION}
              </Label>
              <Textarea
                id="primingCheck"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here"
                rows={4}
                required
              />
            </div>

            {recordingError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Screen sharing required</AlertTitle>
                <AlertDescription>
                  {recordingError} When you click Continue, your browser will prompt you again —
                  please pick this tab.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={!canContinue} size="lg" className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting…
                </>
              ) : (
                "Continue — share screen and start"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
