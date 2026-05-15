import { NextResponse, type NextRequest } from "next/server"

const TESTER_USER = "tester"
const REALM = "remote-ut tester"

function isProtected(pathname: string, method: string): boolean {
  if (pathname.startsWith("/dashboard")) return true
  if (pathname === "/api/tests") return true
  if (pathname.startsWith("/api/tests/")) {
    // /api/tests/[testId] GET is public (participant page reads it)
    if (pathname.endsWith("/sessions")) return true
    if (method === "PATCH" || method === "DELETE") return true
    return false
  }
  if (pathname.startsWith("/api/sessions/") && (method === "GET" || method === "DELETE")) {
    return true
  }
  return false
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}"`,
    },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!isProtected(pathname, req.method)) {
    return NextResponse.next()
  }

  const password = process.env.TESTER_PASSWORD
  if (!password) {
    // If no password is configured, fail closed for protected routes so
    // recordings/configs aren't accidentally public in production.
    return new NextResponse(
      "TESTER_PASSWORD is not configured on the server.",
      { status: 503 },
    )
  }

  const header = req.headers.get("authorization") || ""
  if (!header.startsWith("Basic ")) return unauthorized()

  let decoded: string
  try {
    decoded = atob(header.slice("Basic ".length).trim())
  } catch {
    return unauthorized()
  }

  const sep = decoded.indexOf(":")
  if (sep < 0) return unauthorized()
  const user = decoded.slice(0, sep)
  const pass = decoded.slice(sep + 1)
  if (user !== TESTER_USER || pass !== password) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/tests/:path*", "/api/tests", "/api/sessions/:path*"],
}
