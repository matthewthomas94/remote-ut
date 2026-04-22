// Central spec content. Copy lives here so the flow controller, the priming
// screen, the prototype, the questions, and the dashboard all agree.

export type Scenario = "s1" | "s2"

export const BOSS_NAME = "Sarah"
export const BUSINESS_NAME = "Northwind Trading"

// Hardcoded director set surfaced by the ABN lookup in the prototype.
// Both are treated as the "real" beneficial owners; the participant must
// pick one to invite as the account owner (or bail out to "Contact me").
export const DIRECTORS = [
  {
    id: "eoin",
    firstName: "Eoin",
    lastName: "McConville",
    fullName: "Eoin McConville",
    role: "Director / Partner / Trustee",
    initial: "E",
    inviteEmail: "emcconville@pay.com.au",
  },
  {
    id: "matthew",
    firstName: "Matthew",
    lastName: "Thomas",
    fullName: "Matthew Thomas",
    role: "Director / Partner / Trustee",
    initial: "M",
    inviteEmail: "mthomas@pay.com.au",
  },
] as const

export type DirectorId = (typeof DIRECTORS)[number]["id"]

export const SCENARIO_COPY: Record<Scenario, { label: string; body: string }> = {
  s1: {
    label: "S1 — neutral",
    body:
      `You work at ${BUSINESS_NAME}. Your boss ${BOSS_NAME}, who is the director, ` +
      `has asked you to sign up for Pay, a business payments platform.\n\n` +
      `Go ahead and start the sign-up.`,
  },
  s2: {
    label: "S2 — mandate",
    body:
      `You work at ${BUSINESS_NAME}. Your boss ${BOSS_NAME}, who is the director, ` +
      `has asked you to sign up for Pay, a business payments platform. ` +
      `She wants you to let her know once the account has been created and is ready for use.\n\n` +
      `Go ahead and start the sign-up.`,
  },
}

export const PRIMING_CHECK_QUESTION = `In your own words, what has ${BOSS_NAME} asked you to do?`

// Comprehension questions. `showIf` lets us hide S2-only items for S1.
// Keep this schema loose so new question types can be added without
// touching the form wiring beyond a render branch.
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
  showIf?: (scenario: Scenario) => boolean
}

export const COMPREHENSION_QUESTIONS: Question[] = [
  {
    id: "seqEase",
    type: "scale",
    label:
      "On the screen that asked you to select an account owner, how easy or difficult was it to decide what to do?",
    min: 1,
    max: 7,
    minLabel: "Very difficult",
    maxLabel: "Very easy",
    required: true,
  },
  {
    id: "keyScreenInterpretation",
    type: "textarea",
    label:
      "In your own words, what did the 'Select the account owner' screen seem to be asking you to do?",
    required: true,
    placeholder: "Type your answer here",
  },
  {
    id: "selectionReason",
    type: "textarea",
    label: "Why did you make the choice you made on that screen?",
    required: true,
    placeholder: "Type your answer here",
  },
  {
    id: "nextExpectation",
    type: "textarea",
    label: "What did you expect would happen next after submitting that screen?",
    required: true,
    placeholder: "Type your answer here",
  },
  {
    id: "mandateConfidence",
    type: "scale",
    label: `How confident were you that ${BOSS_NAME} had the authority to ask you to sign up on her behalf?`,
    min: 1,
    max: 5,
    minLabel: "Not at all",
    maxLabel: "Very confident",
    required: true,
    showIf: (s) => s === "s2",
  },
  {
    id: "additionalFeedback",
    type: "textarea",
    label: "Was anything confusing? (Optional)",
    required: false,
    placeholder: "Optional",
  },
]

export function scenarioBadgeClasses(s: Scenario | undefined) {
  if (s === "s1") return "bg-blue-100 text-blue-800 border-blue-200"
  if (s === "s2") return "bg-orange-100 text-orange-800 border-orange-200"
  return "bg-gray-100 text-gray-700 border-gray-200"
}

export function scenarioShortLabel(s: Scenario | undefined) {
  if (s === "s1") return "S1 — neutral"
  if (s === "s2") return "S2 — mandate"
  return "Unknown"
}
