import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const EventSchema = z.object({
  type: z.string(),
  value: z.any().optional(),
  ts: z.string(),
})

const SubmissionSchema = z.object({
  sessionId: z.string().uuid(),
  participantName: z.string().min(1),
  scenario: z.enum(["s1", "s2"]),
  totalChunks: z.number().int().nonnegative(),
  startedAt: z.string(),
  events: z.array(EventSchema),
  // responses is intentionally loose — the comprehension question set is
  // configurable and we want new keys to persist without a schema bump.
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

    const data = parsed.data
    const submittedAt = new Date().toISOString()
    const durationSeconds = Math.max(
      0,
      Math.round((new Date(submittedAt).getTime() - new Date(data.startedAt).getTime()) / 1000),
    )

    const metadata = {
      sessionId: data.sessionId,
      participantName: data.participantName,
      scenario: data.scenario,
      totalChunks: data.totalChunks,
      startedAt: data.startedAt,
      submittedAt,
      durationSeconds,
      events: data.events,
      responses: data.responses,
    }

    // Filename omits participantName — chunks/metadata live in shared Blob
    // and names are PII. SessionId is the only join key.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Local dev without blob configured: log the metadata and succeed so
      // the flow can still be walked end-to-end.
      console.log("[submit-test] Blob not configured — metadata would have been:", metadata)
      return NextResponse.json({ success: true, metadataUrl: null, localOnly: true })
    }

    const blob = await put(
      `${data.sessionId}_metadata.json`,
      JSON.stringify(metadata, null, 2),
      { access: "public", contentType: "application/json" },
    )

    return NextResponse.json({ success: true, metadataUrl: blob.url })
  } catch (error) {
    console.error("[submit-test] Error:", error)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}
