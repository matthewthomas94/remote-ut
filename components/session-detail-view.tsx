"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Question, Session, Test } from "@/lib/types"

interface SessionDetailViewProps {
  session: Session
  test: Test | null
}

function formatDuration(seconds?: number) {
  if (seconds === undefined) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function renderAnswer(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground italic">(no answer)</span>
  }
  if (typeof value === "number") return <span>{value}</span>
  if (typeof value === "string") return <span className="whitespace-pre-wrap">{value}</span>
  return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
}

export function SessionDetailView({ session, test }: SessionDetailViewProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const questions: Question[] = test?.questions ?? []

  const onDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      router.push(test ? `/dashboard/tests/${test.id}` : "/dashboard")
      router.refresh()
    } catch (err) {
      console.error("[session-delete] failed", err)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{session.participantName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {test ? (
              <>Test: {test.title}</>
            ) : (
              <>Test: <span className="italic">missing — may have been deleted</span></>
            )}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this session?</AlertDialogTitle>
              <AlertDialogDescription>
                Removes the response data and all recording chunks. There's no undo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="font-medium mt-0.5 capitalize">{session.status.replace("-", " ")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Terminal</div>
            <div className="font-medium mt-0.5 font-mono text-xs">
              {session.endTerminal ?? <span className="text-muted-foreground">—</span>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="font-medium mt-0.5">{formatDuration(session.durationSeconds)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Chunks</div>
            <div className="font-medium mt-0.5">{session.totalChunks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Started</div>
            <div className="font-medium mt-0.5">{new Date(session.startedAt).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Ended</div>
            <div className="font-medium mt-0.5">
              {session.submittedAt ? (
                new Date(session.submittedAt).toLocaleString()
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.chunkUrls && session.chunkUrls.length > 0 ? (
            session.chunkUrls.map((url, i) => (
              <div key={url} className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>
                    Chunk {i + 1} of {session.chunkUrls!.length}
                  </span>
                  <a
                    href={url}
                    download
                    className="text-primary hover:underline"
                  >
                    Download
                  </a>
                </div>
                <video controls className="w-full rounded border" src={url} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recording chunks for this session.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priming check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="text-xs text-muted-foreground mb-1">
              {test?.primingQuestion ?? "In your own words, what have you been asked to do?"}
            </div>
            {renderAnswer(session.primingCheck)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              The original test config isn't available — showing raw response keys.
            </p>
          )}
          {(questions.length > 0 ? questions : []).map((q) => (
            <div key={q.id}>
              <div className="text-xs text-muted-foreground mb-1">{q.label}</div>
              <div className="text-sm">{renderAnswer(session.responses[q.id])}</div>
            </div>
          ))}
          {questions.length === 0 &&
            Object.entries(session.responses).map(([key, value]) => (
              <div key={key}>
                <div className="text-xs text-muted-foreground mb-1">{key}</div>
                <div className="text-sm">{renderAnswer(value)}</div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs font-mono space-y-1 max-h-96 overflow-y-auto">
            {session.events.map((e, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground shrink-0">
                  {new Date(e.ts).toLocaleTimeString()}
                </span>
                <span className="font-medium">{e.type}</span>
                {e.value !== undefined && (
                  <span className="text-muted-foreground truncate">
                    {typeof e.value === "string" ? e.value : JSON.stringify(e.value)}
                  </span>
                )}
              </div>
            ))}
            {session.events.length === 0 && (
              <span className="text-muted-foreground">No events recorded.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
