export type QuestionType = "text" | "textarea" | "scale"

export type Question = {
  id: string
  type: QuestionType
  label: string
  required: boolean
  placeholder?: string
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
}

export type Test = {
  id: string
  title: string
  prototypeUrl: string
  preamble: string
  primingQuestion: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export type TestSummary = {
  id: string
  title: string
  prototypeUrl: string
  createdAt: string
  updatedAt: string
  sessionCount: number
}

export type LogEvent = { type: string; value?: unknown; ts: string }

export type Session = {
  id: string
  testId: string
  participantName: string
  status: "in-progress" | "completed"
  startedAt: string
  submittedAt?: string
  durationSeconds?: number
  totalChunks?: number
  primingCheck?: string
  events: LogEvent[]
  responses: Record<string, unknown>
  chunkUrls?: string[]
  /** Label received from the prototype's auto-end postMessage, if any. */
  endTerminal?: string
}

export type SessionSummary = {
  id: string
  testId: string
  participantName: string
  status: "in-progress" | "completed"
  startedAt: string
  submittedAt?: string
  durationSeconds?: number
  totalChunks?: number
  endTerminal?: string
}

export const DEFAULT_PRIMING_QUESTION =
  "In your own words, what have you been asked to do?"
