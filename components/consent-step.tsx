"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ConsentStepProps {
  onNext: () => void
  onBack: () => void
}

export function ConsentStep({ onNext, onBack }: ConsentStepProps) {
  const [consent, setConsent] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Before we start</CardTitle>
          <CardDescription className="text-base mt-2">
            Please review the following before you continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">What to expect</h3>
              </div>
            </div>

            <ul className="space-y-3 ml-8 list-disc text-sm text-muted-foreground leading-relaxed">
              <li>Your screen will be recorded during this test.</li>
              <li>You can stop at any time by closing the window.</li>
              <li>Data is used for research purposes only.</li>
              <li>
                You don't need to use real information in form fields — but do fill them in so the
                flow feels realistic.
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(c) => setConsent(c as boolean)}
            />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer select-none">
              I understand and agree to participate
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={onNext} disabled={!consent} className="flex-1" size="lg">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
