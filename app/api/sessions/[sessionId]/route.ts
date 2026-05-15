import { type NextRequest, NextResponse } from "next/server"
import { deleteSession, getSession } from "@/lib/storage"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  try {
    const session = await getSession(sessionId)
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
    return NextResponse.json({ session })
  } catch (error) {
    console.error("[sessions/:id] Get error:", error)
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  try {
    const session = await getSession(sessionId)
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
    await deleteSession(session.testId, sessionId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[sessions/:id] Delete error:", error)
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
