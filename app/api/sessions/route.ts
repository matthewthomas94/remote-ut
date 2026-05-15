import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getTest, saveSession } from "@/lib/storage"
import type { Session } from "@/lib/types"

const CreateSessionSchema = z.object({
  testId: z.string().uuid(),
  participantName: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = CreateSessionSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const test = await getTest(parsed.data.testId)
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 })

    const session: Session = {
      id: crypto.randomUUID(),
      testId: parsed.data.testId,
      participantName: parsed.data.participantName,
      status: "in-progress",
      startedAt: new Date().toISOString(),
      events: [],
      responses: {},
    }
    await saveSession(session)
    return NextResponse.json({ session })
  } catch (error) {
    console.error("[sessions] Create error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
