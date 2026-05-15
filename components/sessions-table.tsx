import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SessionSummary } from "@/lib/types"

interface SessionsTableProps {
  sessions: SessionSummary[]
}

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No participants yet. Share the link above to start collecting sessions.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 border-b">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Participant</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-left font-medium">Terminal</th>
            <th className="px-4 py-2 text-left font-medium">Duration</th>
            <th className="px-4 py-2 text-left font-medium">Started</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b last:border-b-0 hover:bg-muted/30">
              <td className="px-4 py-2 font-medium">{s.participantName}</td>
              <td className="px-4 py-2">
                {s.status === "completed" ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                    completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Clock className="w-3 h-3" />
                    in-progress
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                {s.endTerminal ? (
                  <span className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {s.endTerminal}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{formatDuration(s.durationSeconds)}</td>
              <td className="px-4 py-2 text-muted-foreground">
                {new Date(s.startedAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <Link
                  href={`/dashboard/sessions/${s.id}`}
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  View
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
