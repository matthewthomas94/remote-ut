"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SuccessStep() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Thanks for helping us out</CardTitle>
          <CardDescription className="text-base mt-2">
            Your responses have been recorded. You can close this window now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.close()} variant="outline" className="w-full">
            Close window
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            If the button doesn't work, you can close the tab manually.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
