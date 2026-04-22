import { list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import type { Scenario } from "@/lib/scenarios"

// In-process counter used only when BLOB_READ_WRITE_TOKEN is missing (local
// dev without blob configured). Prod always takes the blob-count path.
let localCounter = 0

// Server-side alternation: even count of completed metadata files → s1, odd → s2.
// Keeps a deterministic 50/50 split without URL params or client-side rng.
// If a participant abandons mid-session, the next participant receives the same
// scenario — acceptable tradeoff for a small-n test per the spec.
export async function POST(_request: NextRequest) {
  try {
    const sessionId = crypto.randomUUID()
    let scenario: Scenario

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list()
      const metadataCount = blobs.filter((b) => b.pathname.endsWith("_metadata.json")).length
      scenario = metadataCount % 2 === 0 ? "s1" : "s2"
    } else {
      scenario = localCounter % 2 === 0 ? "s1" : "s2"
      localCounter += 1
    }

    return NextResponse.json({ sessionId, scenario })
  } catch (error) {
    console.error("[session] Failed to assign scenario:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
