"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Video } from "lucide-react"
import { PRIMING_CHECK_QUESTION, SCENARIO_COPY, type Scenario } from "@/lib/scenarios"

interface PrimingStepProps {
  scenario: Scenario
  onNext: (primingCheck: string) => Promise<void> | void
  onRetryRecording: () => Promise<void> | void
  recordingError: string | null
}

export function PrimingStep({
  scenario,
  onNext,
  onRetryRecording,
  recordingError,
}: PrimingStepProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [retrying, setRetrying] = useState(false)
  // Once the participant has submitted once and been denied, they can't
  // continue without screen sharing — show a retry-only state instead of
  // letting them edit and resubmit.
  const [attempted, setAttempted] = useState(false)

  const copy = SCENARIO_COPY[scenario]
  const blocked = attempted && !!recordingError
  const canSubmit = answer.trim().length > 0 && !submitting && !attempted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setAttempted(true)
    try {
      await onNext(answer.trim())
    } finally {
      // If recording rejected, stay on this step — the retry button becomes
      // the only way forward.
      setSubmitting(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await onRetryRecording()
    } finally {
      setRetrying(false)
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
                disabled={attempted}
              />
            </div>

            {!blocked && (
              <Button type="submit" disabled={!canSubmit} size="lg" className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting…
                  </>
                ) : (
                  "Continue — share screen and start"
                )}
              </Button>
            )}
          </form>

          {blocked && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Screen sharing is required to continue</AlertTitle>
                <AlertDescription>
                  We couldn't start the recording. You must share your screen to participate —
                  click the button below to try again and pick this tab in the prompt.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                size="lg"
                className="w-full"
              >
                {retrying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting permission…
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Share your screen to continue
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
