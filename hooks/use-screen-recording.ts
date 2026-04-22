"use client"

import { useState, useCallback, useRef } from "react"

interface UseScreenRecordingProps {
  sessionId: string
}

const MAX_CHUNK_SIZE = 3.5 * 1024 * 1024 // 3.5MB - safe margin for serverless function payload limit

export function useScreenRecording({ sessionId }: UseScreenRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storedChunks, setStoredChunks] = useState<Blob[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const allChunksRef = useRef<Blob[]>([])
  const currentSizeRef = useRef(0)
  const isRestartingRef = useRef(false)

  const uploadAllChunks = useCallback(
    async (onProgress?: (current: number, total: number) => void) => {
      const chunks = allChunksRef.current
      if (chunks.length === 0) {
        console.log("[v0] No chunks to upload")
        return []
      }

      console.log("[v0] Uploading", chunks.length, "chunks")
      const uploadedUrls: string[] = []

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        if (!chunk || chunk.size === 0) {
          console.error("[v0] Chunk", i, "is empty, skipping")
          continue
        }

        console.log("[v0] Uploading chunk", i, "- Size:", chunk.size, "bytes, Type:", chunk.type)

        // Filename omits participantName per PII hygiene — sessionId only.
        const filename = `${sessionId}_chunk_${i}.webm`

        const file = new File([chunk], filename, { type: "video/webm;codecs=vp8" })
        const formData = new FormData()
        formData.append("file", file)

        let retries = 3
        let uploaded = false

        while (retries > 0 && !uploaded) {
          try {
            console.log("[v0] Upload attempt for chunk", i, "- Retries left:", retries)

            const response = await fetch("/api/upload-recording", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error("[v0] Upload failed with status:", response.status, errorText)
              throw new Error(`Upload failed for chunk ${i}: ${response.status} ${errorText}`)
            }

            const data = await response.json()
            uploadedUrls.push(data.url)
            uploaded = true

            if (onProgress) {
              onProgress(i + 1, chunks.length)
            }

            console.log("[v0] Successfully uploaded chunk", i + 1, "of", chunks.length, "- URL:", data.url)
          } catch (err) {
            retries--
            console.error("[v0] Upload error for chunk", i, "- Retries left:", retries, "Error:", err)

            if (retries > 0) {
              const waitTime = (4 - retries) * 1000
              console.log("[v0] Waiting", waitTime, "ms before retry")
              await new Promise((resolve) => setTimeout(resolve, waitTime))
            } else {
              throw new Error(`Failed to upload chunk ${i} after 3 attempts: ${err}`)
            }
          }
        }
      }

      console.log("[v0] All chunks uploaded successfully. Total URLs:", uploadedUrls.length)
      return uploadedUrls
    },
    [sessionId],
  )

  const restartRecordingForNewChunk = useCallback(() => {
    if (!streamRef.current || isRestartingRef.current) return

    isRestartingRef.current = true
    console.log("[v0] Restarting recording for new chunk")

    // Stop current recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Create new MediaRecorder with same stream
    setTimeout(() => {
      if (!streamRef.current) return

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      currentSizeRef.current = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          currentSizeRef.current += event.data.size

          console.log("[v0] Data received:", event.data.size, "bytes. Current chunk total:", currentSizeRef.current)

          if (currentSizeRef.current >= MAX_CHUNK_SIZE) {
            console.log("[v0] Size limit reached, creating new chunk")
            restartRecordingForNewChunk()
          }
        }
      }

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0 && !isRestartingRef.current) {
          // Final stop - store the last chunk
          const blob = new Blob(chunksRef.current, { type: "video/webm;codecs=vp8" })
          allChunksRef.current.push(blob)
          setStoredChunks([...allChunksRef.current])
          console.log("[v0] Final chunk stored. Total chunks:", allChunksRef.current.length)

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
          }
          setIsRecording(false)
        } else if (chunksRef.current.length > 0 && isRestartingRef.current) {
          // Restarting - store current chunk and continue
          const blob = new Blob(chunksRef.current, { type: "video/webm;codecs=vp8" })
          allChunksRef.current.push(blob)
          setStoredChunks([...allChunksRef.current])
          console.log("[v0] Chunk stored. Total chunks:", allChunksRef.current.length)
          isRestartingRef.current = false
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("[v0] MediaRecorder error:", event)
        setError("Recording error occurred")
      }

      mediaRecorder.start(1000)
      console.log("[v0] Recording restarted for new chunk")
    }, 100)
  }, [])

  // Returns true only when recording is actually live. Callers use the return
  // value to gate progression — false means getDisplayMedia was rejected or
  // the browser doesn't support screen capture, and the UI should stay put.
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setError("Screen recording is not supported in your browser")
        return false
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser", // Prefer browser tab over window/monitor
        },
        audio: false,
        preferCurrentTab: true, // Prefer the current tab (Chrome 109+)
      } as DisplayMediaStreamOptions)

      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      currentSizeRef.current = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          currentSizeRef.current += event.data.size

          console.log("[v0] Data received:", event.data.size, "bytes. Current chunk total:", currentSizeRef.current)

          if (currentSizeRef.current >= MAX_CHUNK_SIZE) {
            console.log("[v0] Size limit reached, creating new chunk")
            restartRecordingForNewChunk()
          }
        }
      }

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0 && !isRestartingRef.current) {
          const blob = new Blob(chunksRef.current, { type: "video/webm;codecs=vp8" })
          allChunksRef.current.push(blob)
          setStoredChunks([...allChunksRef.current])
          console.log("[v0] Final chunk stored. Total chunks:", allChunksRef.current.length)

          stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
          setIsRecording(false)
        } else if (chunksRef.current.length > 0 && isRestartingRef.current) {
          const blob = new Blob(chunksRef.current, { type: "video/webm;codecs=vp8" })
          allChunksRef.current.push(blob)
          setStoredChunks([...allChunksRef.current])
          console.log("[v0] Chunk stored. Total chunks:", allChunksRef.current.length)
          isRestartingRef.current = false
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("[v0] MediaRecorder error:", event)
        setError("Recording error occurred")
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      setError(null)
      console.log("[v0] Recording started")
      return true
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Failed to start recording. Please ensure you granted screen sharing permission.")
      return false
    }
  }, [restartRecordingForNewChunk])

  // Returns a promise that resolves once the MediaRecorder's final onstop has
  // fired and the last chunk is sitting in allChunksRef. Callers that need to
  // upload immediately after must await this — reading `storedChunks` state
  // won't work because React doesn't re-render mid-handler.
  const stopRecording = useCallback((): Promise<Blob[]> => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve([...allChunksRef.current])
    }
    isRestartingRef.current = false
    return new Promise<Blob[]>((resolve) => {
      const previousOnStop = recorder.onstop
      recorder.onstop = (event: Event) => {
        // Let the hook's bookkeeping run first (flush chunk, stop tracks).
        if (typeof previousOnStop === "function") {
          previousOnStop.call(recorder, event)
        }
        resolve([...allChunksRef.current])
      }
      recorder.stop()
    })
  }, [])

  return {
    startRecording,
    stopRecording,
    uploadAllChunks,
    isRecording,
    error,
    storedChunks,
  }
}
