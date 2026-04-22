import { del, list } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Temporary one-shot wipe endpoint. Deletes every blob that looks like a
// user-testing recording (chunks + metadata JSON) so the dashboard can start
// from a clean slate before real test sessions. Requires an explicit confirm
// query param so accidental GETs/crawls don't nuke the data.
//
// Remove this route once the wipe has been confirmed.

const CONFIRM_VALUE = "yes-wipe-all-recordings"

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get("confirm") !== CONFIRM_VALUE) {
    return NextResponse.json(
      { error: `Refusing to wipe without ?confirm=${CONFIRM_VALUE}` },
      { status: 400 },
    )
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 })
  }

  try {
    const { blobs } = await list()
    const targets = blobs.filter(
      (b) => b.pathname.endsWith(".webm") || b.pathname.endsWith("_metadata.json"),
    )

    const urls = targets.map((b) => b.url)
    if (urls.length > 0) {
      await del(urls)
    }

    return NextResponse.json({
      deleted: targets.map((b) => b.pathname),
      count: targets.length,
    })
  } catch (error) {
    console.error("[admin/wipe-recordings] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wipe failed" },
      { status: 500 },
    )
  }
}
