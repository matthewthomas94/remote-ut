"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuestionEditor } from "@/components/question-editor"
import { IntegrationSnippet } from "@/components/integration-snippet"
import type { Question, Test } from "@/lib/types"
import { DEFAULT_PRIMING_QUESTION } from "@/lib/types"

interface TestEditorProps {
  mode: "create" | "edit"
  initial?: Test
}

function defaultInitialState() {
  return {
    title: "",
    prototypeUrl: "",
    preamble: "",
    primingQuestion: DEFAULT_PRIMING_QUESTION,
    questions: [] as Question[],
  }
}

export function TestEditor({ mode, initial }: TestEditorProps) {
  const router = useRouter()
  const initialState = initial
    ? {
        title: initial.title,
        prototypeUrl: initial.prototypeUrl,
        preamble: initial.preamble,
        primingQuestion: initial.primingQuestion,
        questions: initial.questions,
      }
    : defaultInitialState()

  const [title, setTitle] = useState(initialState.title)
  const [prototypeUrl, setPrototypeUrl] = useState(initialState.prototypeUrl)
  const [preamble, setPreamble] = useState(initialState.preamble)
  const [primingQuestion, setPrimingQuestion] = useState(initialState.primingQuestion)
  const [questions, setQuestions] = useState<Question[]>(initialState.questions)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid =
    title.trim().length > 0 &&
    prototypeUrl.trim().length > 0 &&
    preamble.trim().length > 0 &&
    primingQuestion.trim().length > 0 &&
    questions.every((q) => q.label.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        title: title.trim(),
        prototypeUrl: prototypeUrl.trim(),
        preamble: preamble.trim(),
        primingQuestion: primingQuestion.trim(),
        questions,
      }

      const res =
        mode === "create"
          ? await fetch("/api/tests", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/tests/${initial!.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Save failed: ${res.status} ${text}`)
      }
      const data = (await res.json()) as { test: Test }
      router.push(`/dashboard/tests/${data.test.id}`)
      router.refresh()
    } catch (err) {
      console.error("[test-editor] Save error", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>The name you'll see in your dashboard, and the URL participants will be shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Test name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KYB onboarding — round 3"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prototypeUrl">Prototype URL</Label>
            <Input
              id="prototypeUrl"
              type="url"
              value={prototypeUrl}
              onChange={(e) => setPrototypeUrl(e.target.value)}
              placeholder="https://..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Any embeddable URL. Sites that send <code>X-Frame-Options: DENY</code> or a{" "}
              <code>frame-ancestors</code> CSP won't load — Figma's embed URLs usually work.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario</CardTitle>
          <CardDescription>
            Shown to the participant before they share their screen. Set the context for the task.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="preamble">Preamble</Label>
            <Textarea
              id="preamble"
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              placeholder="Describe the scenario the participant should imagine themselves in."
              rows={6}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="primingQuestion">Priming question</Label>
            <Input
              id="primingQuestion"
              value={primingQuestion}
              onChange={(e) => setPrimingQuestion(e.target.value)}
              placeholder={DEFAULT_PRIMING_QUESTION}
              required
            />
            <p className="text-xs text-muted-foreground">
              Asked right before screen-share. Used as a quick comprehension check.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post-test questionnaire</CardTitle>
          <CardDescription>
            Shown after the prototype signals the test has ended (see the integration section
            below).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionEditor questions={questions} onChange={setQuestions} />
        </CardContent>
      </Card>

      <Card className="border-amber-300">
        <CardHeader>
          <CardTitle>Auto-end integration (required)</CardTitle>
          <CardDescription>
            <strong>Required.</strong> Your prototype must call the snippet below on each terminal
            screen — that's the only signal that ends the test and shows the questionnaire. There is
            no manual end-test button by design, so if the integration isn't wired up, participants
            will never reach the questionnaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationSnippet testTitle={title.trim() || undefined} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={!valid || submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === "create" ? "Create test" : "Save changes"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
