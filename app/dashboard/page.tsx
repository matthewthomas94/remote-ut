import Link from "next/link"
import { ArrowRight, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listTests, isBlobConfigured } from "@/lib/storage"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const tests = isBlobConfigured() ? await listTests() : []
  const blobOk = isBlobConfigured()

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a test, share the link, and watch the recordings come in.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tests/new">
            <Plus className="w-4 h-4 mr-1" />
            New test
          </Link>
        </Button>
      </div>

      {!blobOk && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50/60">
          <CardContent className="pt-6 text-sm">
            <strong>Storage not configured.</strong> Set <code>BLOB_READ_WRITE_TOKEN</code> in your
            environment to persist tests and recordings.
          </CardContent>
        </Card>
      )}

      {blobOk && tests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No tests yet. Create your first to get a share link.
            </p>
            <Button asChild>
              <Link href="/dashboard/tests/new">
                <Plus className="w-4 h-4 mr-1" />
                New test
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {tests.map((t) => (
          <Link key={t.id} href={`/dashboard/tests/${t.id}`}>
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{t.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t.prototypeUrl}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t.sessionCount} {t.sessionCount === 1 ? "session" : "sessions"}</span>
                  <span>•</span>
                  <span>Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
