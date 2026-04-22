"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { WelcomeStep } from "@/components/welcome-step"
import { ConsentStep } from "@/components/consent-step"
import { PrimingStep } from "@/components/priming-step"
import { TestStep } from "@/components/test-step"
import { QuestionsStep } from "@/components/questions-step"
import { SuccessStep } from "@/components/success-step"
import { Progress } from "@/components/ui/progress"
import { useScreenRecording } from "@/hooks/use-screen-recording"
import type { Scenario } from "@/lib/scenarios"

export type LogEvent = { type: string; value?: unknown; ts: string }

export type SessionState = {
  sessionId: string | null
  scenario: Scenario | null
  participantName: string
  primingCheck: string
  startedAt: string
  events: LogEvent[]
  responses: Record<string, unknown>
}

const TOTAL_STEPS = 6

export default function Home() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    scenario: null,
    participantName: "",
    primingCheck: "",
    startedAt: new Date().toISOString(),
    events: [],
    responses: {},
  })

  const { startRecording, stopRecording, uploadAllChunks, isRecording, error, storedChunks } =
    useScreenRecording({ sessionId: state.sessionId ?? "pending" })

  // Append-only event log shared with the prototype. Ref so logEvent stays
  // referentially stable across renders.
  const eventsRef = useRef<LogEvent[]>([])
  const logEvent = useCallback((type: string, value?: unknown) => {
    const evt: LogEvent = { type, value, ts: new Date().toISOString() }
    eventsRef.current.push(evt)
    setState((s) => ({ ...s, events: [...eventsRef.current] }))
  }, [])

  const handleWelcomeSubmit = (name: string, sessionId: string, scenario: Scenario) => {
    setState((s) => ({ ...s, participantName: name, sessionId, scenario }))
    logEvent("session_assigned", { scenario })
    setStep(2)
  }

  const handleConsentNext = () => {
    logEvent("consent_granted")
    setStep(3)
  }

  const handlePrimingNext = async (primingCheck: string) => {
    setState((s) => ({ ...s, primingCheck }))
    logEvent("priming_completed")
    // Recording must be active before we drop the participant into the
    // prototype. If getDisplayMedia rejects, keep them on the priming step so
    // they can retry — spec: "do not allow progression without recording".
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

  const handlePrototypeComplete = () => {
    logEvent("prototype_completed")
    setStep(5)
  }

  const handleQuestionsSubmit = (responses: Record<string, unknown>) => {
    setState((s) => ({ ...s, responses }))
    logEvent("questions_submitted")
    setStep(6)
  }

  // Hide the top progress bar when the prototype takes over the viewport
  // and on the terminal success screen.
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
        {step === 1 && <WelcomeStep onNext={handleWelcomeSubmit} />}
        {step === 2 && <ConsentStep onNext={handleConsentNext} onBack={() => setStep(1)} />}
        {step === 3 && state.scenario && (
          <PrimingStep
            scenario={state.scenario}
            onNext={handlePrimingNext}
            onRetryRecording={handleRetryRecording}
            recordingError={error}
          />
        )}
        {step === 4 && state.scenario && (
          <TestStep
            participantName={state.participantName}
            scenario={state.scenario}
            isRecording={isRecording}
            recordingError={error}
            logEvent={logEvent}
            onComplete={handlePrototypeComplete}
          />
        )}
        {step === 5 && state.scenario && state.sessionId && (
          <QuestionsStep
            sessionId={state.sessionId}
            participantName={state.participantName}
            scenario={state.scenario}
            primingCheck={state.primingCheck}
            startedAt={state.startedAt}
            events={state.events}
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
