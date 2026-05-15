import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { TestEditor } from "@/components/test-editor"
import { getTest } from "@/lib/storage"

export const dynamic = "force-dynamic"

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = await params
  const test = await getTest(testId)
  if (!test) notFound()

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        href={`/dashboard/tests/${testId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <h1 className="text-3xl font-bold mb-2">Edit test</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Changes apply to new sessions only. Existing sessions stay as they were.
      </p>
      <TestEditor mode="edit" initial={test} />
    </main>
  )
}
