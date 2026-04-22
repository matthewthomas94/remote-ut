import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list()

    const metadataFiles = blobs.filter((blob) => blob.pathname.endsWith("_metadata.json"))
    const recordingFiles = blobs.filter((blob) => blob.pathname.endsWith(".webm"))

    // Parse recording chunks
    const recordings = recordingFiles.map((blob) => {
      const filename = blob.pathname.split("/").pop() || ""
      const parts = filename.replace(".webm", "").split("_")

      const chunkIndex = parts.lastIndexOf("chunk")
      const participantName = parts.slice(0, chunkIndex - 1).join("_")
      const sessionId = parts[chunkIndex - 1]
      const chunkNumber = Number.parseInt(parts[chunkIndex + 1] || "0", 10)

      return {
        url: blob.url,
        filename: blob.pathname,
        uploadedAt: blob.uploadedAt,
        size: blob.size,
        participantName,
        sessionId,
        chunkNumber,
      }
    })

    const metadataMap = new Map()
    for (const metadataBlob of metadataFiles) {
      try {
        const response = await fetch(metadataBlob.url)
        const metadata = await response.json()
        const key = `${metadata.participantName}_${metadata.sessionId}`
        console.log("[v0] Metadata for session:", key, "variant:", metadata.variant)
        metadataMap.set(key, {
          ...metadata,
          metadataUploadedAt: metadataBlob.uploadedAt,
        })
      } catch (error) {
        console.error("[v0] Error fetching metadata:", error)
      }
    }

    // Group by session
    const sessionMap = new Map<
      string,
      {
        sessionId: string
        participantName: string
        chunks: Array<{
          url: string
          filename: string
          uploadedAt: string
          size: number
          chunkNumber: number
        }>
        totalSize: number
        uploadedAt: string
        variant?: "control" | "test"
        surveyResults?: {
          mainMessage: string
          suggestedAction: string
          noticeability: number
          clarity: number
          additionalFeedback: string
          duration: number
          submittedAt: string
        }
      }
    >()

    recordings.forEach((recording) => {
      const key = `${recording.participantName}_${recording.sessionId}`

      if (!sessionMap.has(key)) {
        const metadata = metadataMap.get(key)
        console.log("[v0] Creating session for:", key, "metadata found:", !!metadata, "variant:", metadata?.variant)
        sessionMap.set(key, {
          sessionId: recording.sessionId,
          participantName: recording.participantName,
          chunks: [],
          totalSize: 0,
          uploadedAt: recording.uploadedAt,
          variant: metadata?.variant,
          surveyResults: metadata
            ? {
                mainMessage: metadata.answers.mainMessage,
                suggestedAction: metadata.answers.suggestedAction,
                noticeability: metadata.answers.noticeability || 0,
                clarity: metadata.answers.clarity || 0,
                additionalFeedback: metadata.answers.additionalFeedback || "",
                duration: metadata.duration,
                submittedAt: metadata.submittedAt,
              }
            : undefined,
        })
      }

      const session = sessionMap.get(key)!
      session.chunks.push({
        url: recording.url,
        filename: recording.filename,
        uploadedAt: recording.uploadedAt,
        size: recording.size,
        chunkNumber: recording.chunkNumber,
      })
      session.totalSize += recording.size

      if (new Date(recording.uploadedAt) > new Date(session.uploadedAt)) {
        session.uploadedAt = recording.uploadedAt
      }
    })

    metadataMap.forEach((metadata, key) => {
      if (!sessionMap.has(key)) {
        console.log("[v0] Creating metadata-only session for:", key, "variant:", metadata.variant)
        sessionMap.set(key, {
          sessionId: metadata.sessionId,
          participantName: metadata.participantName,
          chunks: [],
          totalSize: 0,
          uploadedAt: metadata.metadataUploadedAt,
          variant: metadata.variant,
          surveyResults: {
            mainMessage: metadata.answers.mainMessage,
            suggestedAction: metadata.answers.suggestedAction,
            noticeability: metadata.answers.noticeability || 0,
            clarity: metadata.answers.clarity || 0,
            additionalFeedback: metadata.answers.additionalFeedback || "",
            duration: metadata.duration,
            submittedAt: metadata.submittedAt,
          },
        })
      }
    })

    const sessions = Array.from(sessionMap.values()).map((session) => ({
      ...session,
      chunks: session.chunks.sort((a, b) => a.chunkNumber - b.chunkNumber),
    }))

    sessions.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Error listing recordings:", error)
    return NextResponse.json({ error: "Failed to list recordings" }, { status: 500 })
  }
}
