"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { WelcomeStep } from "@/components/welcome-step"
import { ConsentStep } from "@/components/consent-step"
import { TestStep } from "@/components/test-step"
import { QuestionsStep } from "@/components/questions-step"
import { SuccessStep } from "@/components/success-step"
import { Progress } from "@/components/ui/progress"
import { useScreenRecording } from "@/hooks/use-screen-recording"

export type TestData = {
  participantName: string
  sessionId: string
  consent: boolean
  recordingChunks: string[]
  variant: "control" | "test"
  recordingEnabled: boolean
  answers: {
    mainMessage: string
    suggestedAction: string
    noticeability: number
    clarity: number
    additionalFeedback: string
  }
  timestamp: string
  duration: number
}

export default function Home() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)

  const variant = (searchParams.get("variant") === "test" ? "test" : "control") as "control" | "test"
  const recordingEnabled = searchParams.get("recording") !== "false"

  useEffect(() => {
    console.log("[v0] URL variant parameter:", searchParams.get("variant"))
    console.log("[v0] Resolved variant:", variant)
    console.log("[v0] URL recording parameter:", searchParams.get("recording"))
    console.log("[v0] Recording enabled:", recordingEnabled)
  }, [searchParams, variant, recordingEnabled])

  const [testData, setTestData] = useState<Partial<TestData>>({
    sessionId: crypto.randomUUID(),
    recordingChunks: [],
    timestamp: new Date().toISOString(),
    variant,
    recordingEnabled,
  })

  useEffect(() => {
    console.log("[v0] testData updated:", {
      variant: testData.variant,
      sessionId: testData.sessionId,
      recordingEnabled: testData.recordingEnabled,
    })
  }, [testData.variant, testData.sessionId, testData.recordingEnabled])

  const { startRecording, stopRecording, uploadAllChunks, isRecording, error, storedChunks } = useScreenRecording({
    sessionId: testData.sessionId!,
    participantName: testData.participantName || "unknown",
  })

  useEffect(() => {
    if (step === 3 && testData.participantName && recordingEnabled) {
      startRecording()
    }
  }, [step, testData.participantName, recordingEnabled, startRecording])

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const updateTestData = (data: Partial<TestData>) => {
    setTestData((prev) => ({ ...prev, ...data }))
  }

  return (
    <main className="min-h-screen bg-background">
      {step < 5 && step !== 3 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
              <Progress value={progress} className="flex-1" />
            </div>
          </div>
        </div>
      )}

      <div className={step === 3 ? "" : "container mx-auto px-4 pt-24 pb-12"}>
        {step === 1 && (
          <WelcomeStep
            onNext={(name) => {
              updateTestData({ participantName: name })
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <ConsentStep
            onNext={() => {
              updateTestData({ consent: true })
              setStep(3)
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <TestStep
            participantName={testData.participantName || ""}
            variant={variant}
            isRecording={isRecording}
            recordingError={error}
            onComplete={() => {
              setStep(4)
            }}
          />
        )}

        {step === 4 && (
          <QuestionsStep
            testData={testData as TestData}
            isRecording={isRecording}
            stopRecording={stopRecording}
            uploadAllChunks={uploadAllChunks}
            storedChunks={storedChunks}
            recordingEnabled={recordingEnabled}
            onSubmit={(answers) => {
              updateTestData({ answers })
              setStep(5)
            }}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && <SuccessStep />}
      </div>
    </main>
  )
}
