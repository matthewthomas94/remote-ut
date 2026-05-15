import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession, saveSession } from "@/lib/storage"

const EventSchema = z.object({
  type: z.string(),
  value: z.any().optional(),
  ts: z.string(),
})

const SubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  totalChunks: z.number().int().nonnegative(),
  chunkUrls: z.array(z.string().url()).optional(),
  primingCheck: z.string().optional(),
  endTerminal: z.string().max(64).optional(),
  events: z.array(EventSchema),
  // responses is intentionally loose — the comprehension question set is
  // configurable per-test and we want new keys to persist without a schema bump.
  responses: z.record(z.string(), z.unknown()),
})

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = SubmissionSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload", issues: parsed.error.issues },
        { status: 400 },
      )
    }

    const existing = await getSession(parsed.data.sessionId)
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const submittedAt = new Date().toISOString()
    const durationSeconds = Math.max(
      0,
      Math.round(
        (new Date(submittedAt).getTime() - new Date(existing.startedAt).getTime()) / 1000,
      ),
    )

    const updated = {
      ...existing,
      status: "completed" as const,
      submittedAt,
      durationSeconds,
      totalChunks: parsed.data.totalChunks,
      chunkUrls: parsed.data.chunkUrls,
      primingCheck: parsed.data.primingCheck,
      endTerminal: parsed.data.endTerminal ?? existing.endTerminal,
      events: parsed.data.events,
      responses: parsed.data.responses,
    }

    await saveSession(updated)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[submit-test] Error:", error)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}
