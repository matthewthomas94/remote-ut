import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { listTests, saveTest } from "@/lib/storage"
import { DEFAULT_PRIMING_QUESTION, type Question, type Test } from "@/lib/types"

const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["text", "textarea", "scale"]),
  label: z.string().min(1),
  required: z.boolean(),
  placeholder: z.string().optional(),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
})

const CreateTestSchema = z.object({
  title: z.string().min(1).max(200),
  prototypeUrl: z.string().url(),
  preamble: z.string().min(1),
  primingQuestion: z.string().min(1).optional(),
  questions: z.array(QuestionSchema).max(50),
})

export async function GET() {
  try {
    const tests = await listTests()
    return NextResponse.json({ tests })
  } catch (error) {
    console.error("[tests] List error:", error)
    return NextResponse.json({ error: "Failed to list tests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = CreateTestSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test payload", issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const test: Test = {
      id: crypto.randomUUID(),
      title: parsed.data.title,
      prototypeUrl: parsed.data.prototypeUrl,
      preamble: parsed.data.preamble,
      primingQuestion: parsed.data.primingQuestion || DEFAULT_PRIMING_QUESTION,
      questions: parsed.data.questions as Question[],
      createdAt: now,
      updatedAt: now,
    }
    await saveTest(test)
    return NextResponse.json({ test })
  } catch (error) {
    console.error("[tests] Create error:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
