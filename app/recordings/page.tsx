"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, Calendar, User, Film, MessageSquare, Clock, FlaskConical } from "lucide-react"

interface RecordingChunk {
  url: string
  filename: string
  uploadedAt: string
  size: number
  chunkNumber: number
}

interface Session {
  sessionId: string
  participantName: string
  chunks: RecordingChunk[]
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

export default function RecordingsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingChunk, setPlayingChunk] = useState<string | null>(null)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/list-recordings")

      if (!response.ok) {
        throw new Error("Failed to fetch recordings")
      }

      const data = await response.json()
      console.log("[v0] Recordings page received sessions:", data.sessions)
      data.sessions.forEach((session: Session) => {
        console.log("[v0] Session:", session.sessionId, "variant:", session.variant, "type:", typeof session.variant)
      })
      setSessions(data.sessions)
    } catch (err) {
      console.error("[v0] Error fetching recordings:", err)
      setError("Failed to load recordings")
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recordings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchRecordings}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Recordings</h1>
          <p className="text-gray-600">View and manage all user testing session recordings</p>
        </div>

        {sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recordings yet</h3>
            <p className="text-gray-600">Recordings will appear here once users complete test sessions</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => {
              const isExpanded = expandedSession === session.sessionId
              console.log("[v0] Rendering session:", session.sessionId, "variant:", session.variant)

              return (
                <Card key={session.sessionId} className="overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedSession(isExpanded ? null : session.sessionId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{session.participantName}</h3>
                            <p className="text-sm text-gray-500">Session ID: {session.sessionId}</p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                              !session.variant
                                ? "bg-gray-100 text-gray-600"
                                : session.variant === "control"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            <FlaskConical className="w-3 h-3" />
                            {!session.variant
                              ? "No Variant Data"
                              : session.variant === "control"
                                ? "Control"
                                : "Test Variant"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.uploadedAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4" />
                            {session.chunks.length} chunk{session.chunks.length !== 1 ? "s" : ""}
                          </div>
                          <div className="text-gray-500">Total size: {formatBytes(session.totalSize)}</div>
                          {session.surveyResults && (
                            <div className="flex items-center gap-2 text-green-600">
                              <MessageSquare className="w-4 h-4" />
                              Survey completed
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        {isExpanded ? "Hide" : "View"} Details
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-6 space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FlaskConical className="w-5 h-5" />
                          A/B Test Variant
                        </h4>
                        <div className="bg-white rounded-lg p-6 border">
                          {!session.variant ? (
                            <div className="text-gray-500 text-sm">
                              No variant data available for this session. This may be an older session created before
                              A/B testing was implemented.
                            </div>
                          ) : (
                            <div className="flex items-start gap-4">
                              <div
                                className={`px-4 py-2 rounded-lg font-medium ${
                                  session.variant === "control"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {session.variant === "control" ? "Control Group" : "Test Variant"}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                  {session.variant === "control"
                                    ? "Alert displayed on initial biometrics screen and interim screen"
                                    : "Alert displayed only on final interim screen after SMS sent"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {session.surveyResults && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Survey Results
                          </h4>
                          <div className="bg-white rounded-lg p-6 border space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Main Message</p>
                                <p className="text-gray-900">{session.surveyResults.mainMessage}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Suggested Action</p>
                                <p className="text-gray-900">{session.surveyResults.suggestedAction}</p>
                              </div>
                            </div>

                            <div className="pt-4 border-t">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Test Duration</p>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-gray-400" />
                                  <span className="text-gray-900">
                                    {formatDuration(session.surveyResults.duration)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {session.surveyResults.additionalFeedback && (
                              <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-gray-700 mb-2">Additional Feedback</p>
                                <p className="text-gray-900">{session.surveyResults.additionalFeedback}</p>
                              </div>
                            )}

                            <div className="pt-4 border-t">
                              <p className="text-xs text-gray-500">
                                Submitted: {formatDate(session.surveyResults.submittedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Recording Chunks ({session.chunks.length})</h4>
                        <div className="space-y-4">
                          {session.chunks.map((chunk) => {
                            const isPlaying = playingChunk === chunk.url

                            return (
                              <div key={chunk.url} className="bg-white rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="font-medium text-gray-900">Chunk {chunk.chunkNumber + 1}</p>
                                    <p className="text-sm text-gray-500">
                                      {formatBytes(chunk.size)} • {formatDate(chunk.uploadedAt)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setPlayingChunk(isPlaying ? null : chunk.url)}
                                    >
                                      {isPlaying ? (
                                        <>
                                          <Pause className="w-4 h-4 mr-2" />
                                          Hide
                                        </>
                                      ) : (
                                        <>
                                          <Play className="w-4 h-4 mr-2" />
                                          Play
                                        </>
                                      )}
                                    </Button>
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={chunk.url} download>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </a>
                                    </Button>
                                  </div>
                                </div>

                                {isPlaying && (
                                  <div className="mt-4">
                                    <video src={chunk.url} controls autoPlay className="w-full rounded-lg border">
                                      Your browser does not support video playback.
                                    </video>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
