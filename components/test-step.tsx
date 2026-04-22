"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import PrototypeFlow from "@/components/prototype-flow"
import type { Scenario } from "@/lib/scenarios"

interface TestStepProps {
  participantName: string
  scenario: Scenario
  isRecording: boolean
  recordingError: string | null
  logEvent: (type: string, value?: unknown) => void
  onComplete: () => void
}

export function TestStep({
  participantName,
  scenario,
  isRecording,
  recordingError,
  logEvent,
  onComplete,
}: TestStepProps) {
  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      {isRecording && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Recording Active
        </div>
      )}

      {recordingError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{recordingError}</AlertDescription>
          </Alert>
        </div>
      )}

      <PrototypeFlow
        participantName={participantName}
        scenario={scenario}
        logEvent={logEvent}
        onFinish={onComplete}
      />
    </div>
  )
}
