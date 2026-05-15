import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { deleteTest, getTest, saveTest } from "@/lib/storage"
import type { Question } from "@/lib/types"

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

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  prototypeUrl: z.string().url().optional(),
  preamble: z.string().min(1).optional(),
  primingQuestion: z.string().min(1).optional(),
  questions: z.array(QuestionSchema).max(50).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params
  try {
    const test = await getTest(testId)
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 })
    return NextResponse.json({ test })
  } catch (error) {
    console.error("[tests/:id] Get error:", error)
    return NextResponse.json({ error: "Failed to load test" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params
  try {
    const existing = await getTest(testId)
    if (!existing) return NextResponse.json({ error: "Test not found" }, { status: 404 })

    const raw = await request.json()
    const parsed = PatchSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const updated = {
      ...existing,
      ...parsed.data,
      questions: (parsed.data.questions as Question[] | undefined) ?? existing.questions,
      updatedAt: new Date().toISOString(),
    }
    await saveTest(updated)
    return NextResponse.json({ test: updated })
  } catch (error) {
    console.error("[tests/:id] Patch error:", error)
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params
  try {
    await deleteTest(testId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[tests/:id] Delete error:", error)
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 })
  }
}
