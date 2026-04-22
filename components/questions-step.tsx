"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { COMPREHENSION_QUESTIONS, type Scenario, type Question } from "@/lib/scenarios"
import type { LogEvent } from "@/app/page"

interface QuestionsStepProps {
  sessionId: string
  participantName: string
  scenario: Scenario
  primingCheck: string
  startedAt: string
  events: LogEvent[]
  isRecording: boolean
  stopRecording: () => void
  uploadAllChunks: (onProgress?: (current: number, total: number) => void) => Promise<string[]>
  storedChunks: Blob[]
  onSubmit: (responses: Record<string, unknown>) => void
}

export function QuestionsStep({
  sessionId,
  participantName,
  scenario,
  primingCheck,
  startedAt,
  events,
  isRecording,
  stopRecording,
  uploadAllChunks,
  storedChunks,
  onSubmit,
}: QuestionsStepProps) {
  const visibleQuestions = COMPREHENSION_QUESTIONS.filter((q) => !q.showIf || q.showIf(scenario))
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const isValid = visibleQuestions.every((q) => {
    if (!q.required) return true
    const v = answers[q.id]
    if (q.type === "scale") return typeof v === "number" && v >= (q.min ?? 1)
    return typeof v === "string" && v.trim().length > 0
  })

  const setAnswer = (id: string, value: unknown) =>
    setAnswers((prev) => ({ ...prev, [id]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      // Stop the recorder first so the last chunk lands in storedChunks.
      if (isRecording) stopRecording()
      await new Promise((r) => setTimeout(r, 2000))

      let uploaded: string[] = []
      if (storedChunks.length > 0) {
        uploaded = await uploadAllChunks((current, total) => setUploadProgress({ current, total }))
      }

      const payload = {
        sessionId,
        participantName,
        scenario,
        totalChunks: uploaded.length,
        startedAt,
        events,
        responses: { primingCheck, ...answers },
      }

      const res = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Submission failed: ${res.status} ${text}`)
      }

      onSubmit(answers)
    } catch (err) {
      console.error("[questions] Submit error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsSubmitting(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {isRecording && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Recording Active
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">A few quick questions</CardTitle>
          <CardDescription>
            Tell us what you noticed during the flow you just went through.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {visibleQuestions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}

            {isSubmitting && uploadProgress.total > 0 && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading X of Y chunks — please don't close this window</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {uploadProgress.current} of {uploadProgress.total} chunks
                </div>
                <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
              </div>
            )}

            {error && (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm">
                {error} — please try submitting again.
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={!isValid || isSubmitting} className="w-full" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress.total > 0 ? "Uploading…" : "Submitting…"}
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (question.type === "text") {
    return (
      <div className="space-y-2">
        <Label htmlFor={question.id} className="text-base">
          {question.label} {!question.required && <span className="text-muted-foreground text-sm">(optional)</span>}
        </Label>
        <Input
          id={question.id}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          required={question.required}
        />
      </div>
    )
  }

  if (question.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={question.id} className="text-base">
          {question.label} {!question.required && <span className="text-muted-foreground text-sm">(optional)</span>}
        </Label>
        <Textarea
          id={question.id}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          required={question.required}
        />
      </div>
    )
  }

  // scale
  const min = question.min ?? 1
  const max = question.max ?? 7
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const current = typeof value === "number" ? value : null
  return (
    <div className="space-y-2">
      <Label className="text-base">{question.label}</Label>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground w-24">{question.minLabel}</span>
        <div className="flex gap-2 flex-wrap justify-center flex-1">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                current === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white hover:border-primary/50"
              }`}
              aria-label={`${n} of ${max}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground w-24 text-right">{question.maxLabel}</span>
      </div>
    </div>
  )
}
