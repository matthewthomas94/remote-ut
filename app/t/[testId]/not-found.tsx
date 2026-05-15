import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">This test link is invalid</CardTitle>
          <CardDescription className="text-base mt-2">
            The test you're trying to reach either no longer exists or the link is wrong. Please
            check with the person who sent it to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Return home
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
