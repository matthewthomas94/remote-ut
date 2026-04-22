"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Download,
  Film,
  MessageSquare,
  Pause,
  Play,
  User,
} from "lucide-react"
import {
  scenarioBadgeClasses,
  scenarioShortLabel,
  type Scenario,
} from "@/lib/scenarios"

type Chunk = {
  url: string
  filename: string
  uploadedAt: string
  size: number
  chunkNumber: number
}

type Session = {
  sessionId: string
  participantName: string
  scenario?: Scenario
  totalChunks?: number
  startedAt?: string
  submittedAt?: string
  durationSeconds?: number
  events?: Array<{ type: string; value?: unknown; ts: string }>
  responses?: Record<string, unknown>
  chunks: Chunk[]
  totalSize: number
  uploadedAt: string
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

function formatDate(dateString?: string) {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleString()
}

function formatDuration(seconds?: number) {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function RecordingsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/list-recordings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => setSessions(d.sessions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const total = sessions.length
    const s1 = sessions.filter((s) => s.scenario === "s1")
    const s2 = sessions.filter((s) => s.scenario === "s2")
    const avg = (arr: Session[]) => {
      const xs = arr.map((s) => s.durationSeconds ?? 0).filter((n) => n > 0)
      if (xs.length === 0) return 0
      return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
    }
    return {
      total,
      s1: s1.length,
      s2: s2.length,
      avgS1: avg(s1),
      avgS2: avg(s2),
    }
  }, [sessions])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading recordings…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => location.reload()}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">KYB uplift user test — recordings</h1>
            <p className="text-gray-600">
              Each participant hits one of two scenario variants (S1 neutral, S2 mandate) and is
              routed through the same prototype.
            </p>
          </div>
          <Button variant="outline" onClick={() => downloadCsv(sessions)}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total sessions" value={stats.total} />
          <StatCard
            label="S1 — neutral"
            value={stats.s1}
            hint={stats.avgS1 > 0 ? `avg ${formatDuration(stats.avgS1)}` : undefined}
            accent="blue"
          />
          <StatCard
            label="S2 — mandate"
            value={stats.s2}
            hint={stats.avgS2 > 0 ? `avg ${formatDuration(stats.avgS2)}` : undefined}
            accent="orange"
          />
          <StatCard
            label="Split"
            value={`${stats.s1} / ${stats.s2}`}
            hint="S1 / S2"
          />
        </div>

        {sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No recordings yet</h3>
            <p className="text-gray-600">
              Sessions will appear here once participants complete the test.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expanded === session.sessionId
              return (
                <Card key={session.sessionId} className="overflow-hidden">
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpanded(isExpanded ? null : session.sessionId)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {session.participantName}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {session.sessionId.slice(0, 8)}…
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${scenarioBadgeClasses(session.scenario)}`}
                          >
                            {scenarioShortLabel(session.scenario)}
                          </span>
                          {session.submittedAt && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                              <MessageSquare className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 pl-12">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.submittedAt ?? session.uploadedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.durationSeconds)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            {session.chunks.length} chunk{session.chunks.length === 1 ? "" : "s"} · {formatBytes(session.totalSize)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {isExpanded ? "Hide" : "View"} details
                      </Button>
                    </div>
                  </div>

                  {isExpanded && <ExpandedSession session={session} playing={playing} setPlaying={setPlaying} />}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: number | string
  hint?: string
  accent?: "blue" | "orange"
}) {
  const accentClass =
    accent === "blue"
      ? "border-l-4 border-blue-500"
      : accent === "orange"
      ? "border-l-4 border-orange-500"
      : ""
  return (
    <Card className={`p-4 ${accentClass}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </Card>
  )
}

function ExpandedSession({
  session,
  playing,
  setPlaying,
}: {
  session: Session
  playing: string | null
  setPlaying: (url: string | null) => void
}) {
  const { responses = {}, events = [] } = session
  const primingCheck = typeof responses.primingCheck === "string" ? responses.primingCheck : ""
  const otherResponses = Object.entries(responses).filter(([k]) => k !== "primingCheck")

  return (
    <div className="border-t bg-gray-50 p-6 space-y-6">
      <section>
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Scenario shown</h4>
        <div className="bg-white rounded p-4 border text-sm text-gray-700">
          {scenarioShortLabel(session.scenario)}
        </div>
      </section>

      <section>
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Priming check</h4>
        <div className="bg-white rounded p-4 border text-sm text-gray-800 whitespace-pre-wrap">
          {primingCheck || <span className="text-gray-400">(none)</span>}
        </div>
      </section>

      {otherResponses.length > 0 && (
        <section>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Comprehension responses</h4>
          <div className="bg-white rounded p-4 border space-y-3">
            {otherResponses.map(([k, v]) => (
              <div key={k}>
                <div className="text-xs font-medium text-gray-700 mb-1">{k}</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Event timeline ({events.length})</h4>
        <div className="bg-white rounded border max-h-72 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="text-left p-2 w-44">Timestamp</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-mono">{new Date(e.ts).toLocaleTimeString()}</td>
                  <td className="p-2">{e.type}</td>
                  <td className="p-2 font-mono text-gray-700">
                    {e.value ? JSON.stringify(e.value) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">
          Recording chunks ({session.chunks.length})
        </h4>
        <div className="space-y-3">
          {session.chunks.map((chunk) => {
            const isPlaying = playing === chunk.url
            return (
              <div key={chunk.url} className="bg-white rounded p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Chunk {chunk.chunkNumber + 1}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(chunk.size)} • {formatDate(chunk.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPlaying(isPlaying ? null : chunk.url)}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={chunk.url} download>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                {isPlaying && (
                  <video src={chunk.url} controls autoPlay className="w-full rounded border">
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function downloadCsv(sessions: Session[]) {
  // Flatten responses into columns so analysts can sort/filter in sheets.
  // Any new response key shows up automatically.
  const responseKeys = Array.from(
    new Set(sessions.flatMap((s) => Object.keys(s.responses ?? {}))),
  )
  const headers = [
    "sessionId",
    "participantName",
    "scenario",
    "startedAt",
    "submittedAt",
    "durationSeconds",
    "totalChunks",
    ...responseKeys.map((k) => `response.${k}`),
  ]
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return ""
    const s = typeof v === "string" ? v : JSON.stringify(v)
    return `"${s.replace(/"/g, '""')}"`
  }
  const rows = sessions.map((s) =>
    [
      s.sessionId,
      s.participantName,
      s.scenario ?? "",
      s.startedAt ?? "",
      s.submittedAt ?? "",
      s.durationSeconds ?? "",
      s.totalChunks ?? s.chunks.length,
      ...responseKeys.map((k) => s.responses?.[k]),
    ]
      .map(escape)
      .join(","),
  )
  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `kyb-uplift-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
