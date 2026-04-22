import { list } from "@vercel/blob"
import { NextResponse } from "next/server"
import type { Scenario } from "@/lib/scenarios"

// Chunk filename pattern: {sessionId}_chunk_{N}.webm
// Metadata filename pattern: {sessionId}_metadata.json
// Legacy v0 filenames prefix {participantName}_ — we still parse those so
// existing recordings keep rendering until they roll off.

type ChunkInfo = {
  url: string
  filename: string
  uploadedAt: string
  size: number
  chunkNumber: number
}

type SessionMetadata = {
  sessionId: string
  participantName: string
  scenario?: Scenario
  totalChunks?: number
  startedAt?: string
  submittedAt?: string
  durationSeconds?: number
  events?: Array<{ type: string; value?: unknown; ts: string }>
  responses?: Record<string, unknown>
}

type SessionRecord = SessionMetadata & {
  chunks: ChunkInfo[]
  totalSize: number
  uploadedAt: string
}

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

function parseChunkFilename(pathname: string): {
  sessionId: string
  chunkNumber: number
} | null {
  const filename = pathname.split("/").pop() || ""
  const base = filename.replace(/\.webm$/, "")
  // Match _chunk_N at the end, and a UUID anywhere in the name.
  const chunkMatch = base.match(/_chunk_(\d+)$/)
  const idMatch = base.match(UUID_RE)
  if (!chunkMatch || !idMatch) return null
  return { sessionId: idMatch[0], chunkNumber: parseInt(chunkMatch[1], 10) }
}

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Local dev without blob configured: return empty so the dashboard
      // still renders (shows "No recordings yet").
      return NextResponse.json({ sessions: [] })
    }
    const { blobs } = await list()
    const metadataFiles = blobs.filter((b) => b.pathname.endsWith("_metadata.json"))
    const recordingFiles = blobs.filter((b) => b.pathname.endsWith(".webm"))

    const sessions = new Map<string, SessionRecord>()

    // Vercel Blob returns uploadedAt as Date; normalise to ISO strings.
    const isoFrom = (d: Date | string) => (d instanceof Date ? d.toISOString() : d)

    // Hydrate metadata first so chunks can attach to known sessions.
    for (const md of metadataFiles) {
      try {
        const res = await fetch(md.url)
        const parsed = (await res.json()) as SessionMetadata
        if (!parsed.sessionId) continue
        sessions.set(parsed.sessionId, {
          ...parsed,
          chunks: [],
          totalSize: 0,
          uploadedAt: isoFrom(md.uploadedAt),
        })
      } catch (err) {
        console.error("[list-recordings] Failed to parse metadata:", md.pathname, err)
      }
    }

    // Attach chunks.
    for (const rec of recordingFiles) {
      const parsed = parseChunkFilename(rec.pathname)
      if (!parsed) continue
      const recUploadedAt = isoFrom(rec.uploadedAt)

      let session = sessions.get(parsed.sessionId)
      if (!session) {
        session = {
          sessionId: parsed.sessionId,
          participantName: "Unknown",
          chunks: [],
          totalSize: 0,
          uploadedAt: recUploadedAt,
        }
        sessions.set(parsed.sessionId, session)
      }

      session.chunks.push({
        url: rec.url,
        filename: rec.pathname,
        uploadedAt: recUploadedAt,
        size: rec.size,
        chunkNumber: parsed.chunkNumber,
      })
      session.totalSize += rec.size
      if (new Date(recUploadedAt) > new Date(session.uploadedAt)) {
        session.uploadedAt = recUploadedAt
      }
    }

    const ordered = Array.from(sessions.values()).map((s) => ({
      ...s,
      chunks: s.chunks.sort((a, b) => a.chunkNumber - b.chunkNumber),
    }))
    ordered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ sessions: ordered })
  } catch (error) {
    console.error("[list-recordings] Error:", error)
    return NextResponse.json({ error: "Failed to list recordings" }, { status: 500 })
  }
}
