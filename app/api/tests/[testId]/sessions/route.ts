import { type NextRequest, NextResponse } from "next/server"
import { listSessionsForTest } from "@/lib/storage"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  const { testId } = await params
  try {
    const sessions = await listSessionsForTest(testId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[tests/:id/sessions] Error:", error)
    return NextResponse.json({ error: "Failed to list sessions" }, { status: 500 })
  }
}
