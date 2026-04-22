"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { TestData } from "@/app/page"

interface QuestionsStepProps {
  testData: TestData
  isRecording: boolean
  stopRecording: () => void
  uploadAllChunks: (onProgress?: (current: number, total: number) => void) => Promise<string[]>
  storedChunks: Blob[]
  recordingEnabled: boolean
  onSubmit: (answers: TestData["answers"]) => void
  onBack: () => void
}

export function QuestionsStep({
  testData,
  isRecording,
  stopRecording,
  uploadAllChunks,
  storedChunks,
  recordingEnabled,
  onSubmit,
  onBack,
}: QuestionsStepProps) {
  const [answers, setAnswers] = useState({
    mainMessage: "",
    suggestedAction: "",
    noticeability: 0,
    clarity: 0,
    additionalFeedback: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  const isValid = answers.mainMessage.trim() && answers.suggestedAction.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)

    try {
      console.log("[v0] testData.variant before submission:", testData.variant)
      console.log("[v0] Recording enabled:", recordingEnabled)
      console.log("[v0] Full testData:", testData)

      let uploadedUrls: string[] = []

      if (recordingEnabled) {
        console.log("[v0] Stopping recording before submission")
        stopRecording()

        await new Promise((resolve) => setTimeout(resolve, 2000))

        console.log("[v0] Starting upload of", storedChunks.length, "chunks")

        if (storedChunks.length === 0) {
          throw new Error("No recording chunks found. Please ensure recording was active during the test.")
        }

        uploadedUrls = await uploadAllChunks((current, total) => {
          console.log("[v0] Upload progress:", current, "of", total)
          setUploadProgress({ current, total })
        })

        if (uploadedUrls.length === 0) {
          throw new Error("No chunks were successfully uploaded. Please try again.")
        }

        console.log("[v0] All chunks uploaded, submitting metadata")
      } else {
        console.log("[v0] Recording disabled, skipping upload")
      }

      const submissionData = {
        ...testData,
        recordingChunks: uploadedUrls,
        answers,
        duration: Date.now() - new Date(testData.timestamp).getTime(),
      }
      console.log("[v0] Submission payload:", submissionData)
      console.log("[v0] Submission payload variant:", submissionData.variant)
      console.log("[v0] Submission payload recordingEnabled:", submissionData.recordingEnabled)

      const response = await fetch("/api/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Submission failed:", response.status, errorText)
        throw new Error(`Submission failed: ${response.status}`)
      }

      console.log("[v0] Submission successful")
      onSubmit(answers)
    } catch (error) {
      console.error("[v0] Submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to submit: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
      setIsSubmitting(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {isRecording && recordingEnabled && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Recording Active
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Comprehension Questions</CardTitle>
          <CardDescription>Please answer the following questions about your experience during the test</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="mainMessage">At what point in the flow did you first notice the yellow alert?</Label>
              <Textarea
                id="mainMessage"
                placeholder="Describe the main message..."
                value={answers.mainMessage}
                onChange={(e) => setAnswers({ ...answers, mainMessage: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedAction">What action, if any, did the yellow alert suggest you take?</Label>
              <Textarea
                id="suggestedAction"
                placeholder="Describe any suggested actions..."
                value={answers.suggestedAction}
                onChange={(e) => setAnswers({ ...answers, suggestedAction: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalFeedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="additionalFeedback"
                placeholder="Any other thoughts or observations..."
                value={answers.additionalFeedback}
                onChange={(e) => setAnswers({ ...answers, additionalFeedback: e.target.value })}
                rows={4}
              />
            </div>

            {isSubmitting && recordingEnabled && uploadProgress.total > 0 && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading recordings...</span>
                  <span className="text-muted-foreground">
                    {uploadProgress.current} of {uploadProgress.total} chunks
                  </span>
                </div>
                <Progress value={(uploadProgress.current / uploadProgress.total) * 100} />
                <p className="text-xs text-muted-foreground">Please don't close this window until upload is complete</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress.total > 0 ? "Uploading..." : "Submitting..."}
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
