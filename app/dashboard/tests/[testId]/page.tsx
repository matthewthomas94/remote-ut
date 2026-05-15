import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteTestButton } from "@/components/delete-test-button"
import { IntegrationSnippet } from "@/components/integration-snippet"
import { SessionsTable } from "@/components/sessions-table"
import { ShareLink } from "@/components/share-link"
import { getTest, listSessionsForTest } from "@/lib/storage"

export const dynamic = "force-dynamic"

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = await params
  const test = await getTest(testId)
  if (!test) notFound()

  const sessions = await listSessionsForTest(testId)

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to tests
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold truncate">{test.title}</h1>
          <a
            href={test.prototypeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1 hover:text-foreground truncate"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{test.prototypeUrl}</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/tests/${test.id}/edit`}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Link>
          </Button>
          <DeleteTestButton testId={test.id} />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Share link</CardTitle>
          <CardDescription>Anyone with this link can start a session.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShareLink testId={test.id} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preamble</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{test.preamble}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions ({test.questions.length})</CardTitle>
            <CardDescription>Asked after the participant ends the test.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2 list-decimal ml-5">
              {test.questions.map((q) => (
                <li key={q.id}>
                  <span className="font-medium">{q.label}</span>{" "}
                  <span className="text-xs text-muted-foreground">({q.type}{q.required ? "" : ", optional"})</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-300">
        <CardHeader>
          <CardTitle className="text-base">Auto-end integration (required)</CardTitle>
          <CardDescription>
            <strong>Required.</strong> Your prototype must call this snippet on each terminal screen
            — that's the only way the test ends and the questionnaire appears. Drop the snippet in
            yourself, or copy the AI prompt and let Claude / Cursor / Codex wire it up for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationSnippet testTitle={test.title} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Sessions</h2>
        <SessionsTable sessions={sessions} />
      </div>
    </main>
  )
}
