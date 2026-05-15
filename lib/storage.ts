import { list, put, del } from "@vercel/blob"
import type { Test, TestSummary, Session, SessionSummary } from "./types"

const TESTS_PREFIX = "tests/"
const SESSIONS_PREFIX = "sessions/"

function testKey(testId: string) {
  return `${TESTS_PREFIX}${testId}.json`
}

function sessionKey(testId: string, sessionId: string) {
  return `${SESSIONS_PREFIX}${testId}/${sessionId}.json`
}

function sessionPrefix(testId: string) {
  return `${SESSIONS_PREFIX}${testId}/`
}

export function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function saveTest(test: Test): Promise<Test> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured")
  }
  await put(testKey(test.id), JSON.stringify(test, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  })
  return test
}

export async function getTest(testId: string): Promise<Test | null> {
  if (!isBlobConfigured()) return null
  const { blobs } = await list({ prefix: testKey(testId) })
  const match = blobs.find((b) => b.pathname === testKey(testId))
  if (!match) return null
  return fetchJson<Test>(match.url)
}

export async function listTests(): Promise<TestSummary[]> {
  if (!isBlobConfigured()) return []
  const { blobs } = await list({ prefix: TESTS_PREFIX })
  const tests = await Promise.all(
    blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .map(async (b) => {
        const test = await fetchJson<Test>(b.url)
        if (!test) return null
        const sessions = await listSessionsForTest(test.id)
        const summary: TestSummary = {
          id: test.id,
          title: test.title,
          prototypeUrl: test.prototypeUrl,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt,
          sessionCount: sessions.length,
        }
        return summary
      }),
  )
  return tests
    .filter((t): t is TestSummary => t !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function deleteTest(testId: string): Promise<void> {
  if (!isBlobConfigured()) return
  const { blobs: testBlobs } = await list({ prefix: testKey(testId) })
  const { blobs: sessionBlobs } = await list({ prefix: sessionPrefix(testId) })
  const urls = [...testBlobs, ...sessionBlobs].map((b) => b.url)
  if (urls.length > 0) await del(urls)
}

export async function saveSession(session: Session): Promise<Session> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured")
  }
  await put(
    sessionKey(session.testId, session.id),
    JSON.stringify(session, null, 2),
    {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    },
  )
  return session
}

export async function getSession(sessionId: string): Promise<Session | null> {
  if (!isBlobConfigured()) return null
  // We don't know which testId owns the session, so list all session prefixes
  // and find the match. Sessions are small JSONs; this is acceptable for the
  // current scale (single-tester, tens of tests).
  const { blobs } = await list({ prefix: SESSIONS_PREFIX })
  const match = blobs.find((b) => b.pathname.endsWith(`/${sessionId}.json`))
  if (!match) return null
  return fetchJson<Session>(match.url)
}

export async function listSessionsForTest(testId: string): Promise<SessionSummary[]> {
  if (!isBlobConfigured()) return []
  const { blobs } = await list({ prefix: sessionPrefix(testId) })
  const sessions = await Promise.all(
    blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .map(async (b) => {
        const session = await fetchJson<Session>(b.url)
        if (!session) return null
        const summary: SessionSummary = {
          id: session.id,
          testId: session.testId,
          participantName: session.participantName,
          status: session.status,
          startedAt: session.startedAt,
          submittedAt: session.submittedAt,
          durationSeconds: session.durationSeconds,
          totalChunks: session.totalChunks,
          endTerminal: session.endTerminal,
        }
        return summary
      }),
  )
  return sessions
    .filter((s): s is SessionSummary => s !== null)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export async function deleteSession(testId: string, sessionId: string): Promise<void> {
  if (!isBlobConfigured()) return
  // Delete the session metadata blob.
  const key = sessionKey(testId, sessionId)
  const { blobs: metaBlobs } = await list({ prefix: key })
  const metaUrls = metaBlobs.filter((b) => b.pathname === key).map((b) => b.url)
  // Delete the recording chunks (named <sessionId>_chunk_<N>.webm at root).
  const { blobs: chunkBlobs } = await list({ prefix: `${sessionId}_chunk_` })
  const chunkUrls = chunkBlobs.map((b) => b.url)
  const all = [...metaUrls, ...chunkUrls]
  if (all.length > 0) await del(all)
}
