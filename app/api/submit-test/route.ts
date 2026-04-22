import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("[v0] submit-test received data:", data)
    console.log("[v0] submit-test received variant:", data.variant)

    // Create metadata JSON
    const metadata = {
      participantName: data.participantName,
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      duration: data.duration,
      recordingChunks: data.recordingChunks,
      variant: data.variant, // Include A/B test variant
      answers: data.answers,
      submittedAt: new Date().toISOString(),
    }

    console.log("[v0] submit-test metadata to upload:", metadata)
    console.log("[v0] submit-test metadata variant:", metadata.variant)

    // Upload metadata to Blob
    const metadataBlob = await put(
      `${data.participantName}_${data.sessionId}_metadata.json`,
      JSON.stringify(metadata, null, 2),
      {
        access: "public",
        contentType: "application/json",
      },
    )

    console.log("[v0] Metadata uploaded:", metadataBlob.url)

    return NextResponse.json({
      success: true,
      metadataUrl: metadataBlob.url,
    })
  } catch (error) {
    console.error("[v0] Submission error:", error)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}
