"use client"

import { useCallback, useRef, useState } from "react"
import { WelcomeStep } from "@/components/welcome-step"
import { ConsentStep } from "@/components/consent-step"
import { PrimingStep } from "@/components/priming-step"
import { IframeTestStep } from "@/components/iframe-test-step"
import { QuestionsStep } from "@/components/questions-step"
import { SuccessStep } from "@/components/success-step"
import { Progress } from "@/components/ui/progress"
import { useScreenRecording } from "@/hooks/use-screen-recording"
import type { LogEvent, Question } from "@/lib/types"

const TOTAL_STEPS = 6

type Props = {
  testId: string
  title: string
  prototypeUrl: string
  preamble: string
  primingQuestion: string
  questions: Question[]
}

export function ParticipantFlow({
  testId,
  title,
  prototypeUrl,
  preamble,
  primingQuestion,
  questions,
}: Props) {
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [primingCheck, setPrimingCheck] = useState("")
  const [events, setEvents] = useState<LogEvent[]>([])
  const [endTerminal, setEndTerminal] = useState<string | undefined>(undefined)

  const eventsRef = useRef<LogEvent[]>([])
  const logEvent = useCallback((type: string, value?: unknown) => {
    const evt: LogEvent = { type, value, ts: new Date().toISOString() }
    eventsRef.current.push(evt)
    setEvents([...eventsRef.current])
  }, [])

  const { startRecording, stopRecording, uploadAllChunks, isRecording, error, storedChunks } =
    useScreenRecording({ sessionId: sessionId ?? "pending" })

  const handleWelcomeSubmit = (_name: string, newSessionId: string) => {
    setSessionId(newSessionId)
    logEvent("session_assigned", { testId })
    setStep(2)
  }

  const handleConsentNext = () => {
    logEvent("consent_granted")
    setStep(3)
  }

  const handlePrimingNext = async (answer: string) => {
    setPrimingCheck(answer)
    logEvent("priming_completed")
    const started = await startRecording()
    if (!started) {
      logEvent("recording_permission_denied")
      return
    }
    setStep(4)
  }

  const handleRetryRecording = async () => {
    logEvent("recording_retry_attempt")
    const started = await startRecording()
    if (!started) {
      logEvent("recording_permission_denied")
      return
    }
    setStep(4)
  }

  const handlePrototypeComplete = (terminal?: string) => {
    if (terminal) setEndTerminal(terminal)
    logEvent("prototype_completed", terminal ? { terminal } : undefined)
    setStep(5)
  }

  const handleQuestionsSubmit = (_responses: Record<string, unknown>) => {
    logEvent("questions_submitted")
    setStep(6)
  }

  const showProgress = step !== 4 && step < 6
  const progress = (step / TOTAL_STEPS) * 100

  return (
    <main className="min-h-screen bg-background">
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {step} of {TOTAL_STEPS}
              </span>
              <Progress value={progress} className="flex-1" />
            </div>
          </div>
        </div>
      )}

      <div className={step === 4 ? "" : "container mx-auto px-4 pt-24 pb-12"}>
        {step === 1 && (
          <WelcomeStep testId={testId} testTitle={title} onNext={handleWelcomeSubmit} />
        )}
        {step === 2 && <ConsentStep onNext={handleConsentNext} onBack={() => setStep(1)} />}
        {step === 3 && (
          <PrimingStep
            preamble={preamble}
            primingQuestion={primingQuestion}
            onNext={handlePrimingNext}
            onRetryRecording={handleRetryRecording}
            recordingError={error}
          />
        )}
        {step === 4 && (
          <IframeTestStep
            prototypeUrl={prototypeUrl}
            isRecording={isRecording}
            recordingError={error}
            logEvent={logEvent}
            onComplete={handlePrototypeComplete}
          />
        )}
        {step === 5 && sessionId && (
          <QuestionsStep
            sessionId={sessionId}
            questions={questions}
            primingCheck={primingCheck}
            endTerminal={endTerminal}
            events={events}
            isRecording={isRecording}
            stopRecording={stopRecording}
            uploadAllChunks={uploadAllChunks}
            storedChunks={storedChunks}
            onSubmit={handleQuestionsSubmit}
          />
        )}
        {step === 6 && <SuccessStep />}
      </div>
    </main>
  )
}
