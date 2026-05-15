import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { SessionDetailView } from "@/components/session-detail-view"
import { getSession, getTest } from "@/lib/storage"

export const dynamic = "force-dynamic"

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const session = await getSession(sessionId)
  if (!session) notFound()

  const test = await getTest(session.testId)

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      <Link
        href={test ? `/dashboard/tests/${test.id}` : "/dashboard"}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <SessionDetailView session={session} test={test} />
    </main>
  )
}
