"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import PrototypeFlow from "@/components/prototype-flow"

interface TestStepProps {
  participantName: string
  variant: "control" | "test"
  isRecording: boolean
  recordingError: string | null
  onComplete: () => void
}

export function TestStep({ participantName, variant, isRecording, recordingError, onComplete }: TestStepProps) {
  return (
    <div className="fixed inset-0 bg-background">
      {isRecording && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Recording Active
        </div>
      )}

      {recordingError && (
        <div className="absolute top-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{recordingError}</AlertDescription>
          </Alert>
        </div>
      )}

      <PrototypeFlow participantName={participantName} variant={variant} onFinish={onComplete} />
    </div>
  )
}
