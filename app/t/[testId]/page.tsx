import { notFound } from "next/navigation"
import { getTest } from "@/lib/storage"
import { ParticipantFlow } from "./participant-flow"

export const dynamic = "force-dynamic"

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = await params
  const test = await getTest(testId)
  if (!test) notFound()

  return (
    <ParticipantFlow
      testId={test.id}
      title={test.title}
      prototypeUrl={test.prototypeUrl}
      preamble={test.preamble}
      primingQuestion={test.primingQuestion}
      questions={test.questions}
    />
  )
}
