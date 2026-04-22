import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload request received")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    if (file.size === 0) {
      console.error("[v0] File is empty:", file.name)
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      console.error("[v0] File too large:", file.name, file.size, "bytes")
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("[v0] File converted to buffer, size:", buffer.length, "bytes")

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")

    console.log("[v0] Uploading to Blob storage:", sanitizedFilename)

    const blob = await Promise.race([
      put(sanitizedFilename, buffer, {
        access: "public",
        contentType: file.type || "video/webm",
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Upload timeout after 60s")), 60000)),
    ])

    console.log("[v0] Upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: sanitizedFilename,
      size: file.size,
    })
  } catch (error) {
    console.error("[v0] Upload error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    })

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 })
  }
}
