import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TestEditor } from "@/components/test-editor"

export default function NewTestPage() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to tests
      </Link>
      <h1 className="text-3xl font-bold mb-2">New test</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Paste your prototype URL and write your scenario. You can edit any of this later.
      </p>
      <TestEditor mode="create" />
    </main>
  )
}
