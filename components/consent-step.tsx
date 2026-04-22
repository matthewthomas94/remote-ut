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
          <CardTitle className="text-2xl font-bold">Informed Consent</CardTitle>
          <CardDescription className="text-base mt-2">
            Please review the following information before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">About This Study</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This study involves completing a task while your screen is being recorded. Here's what you need to
                  know:
                </p>
              </div>
            </div>

            <ul className="space-y-3 ml-8">
              <li className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Screen recording:</strong> Only the current browser tab will be
                  captured, not your entire screen
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Data usage:</strong> Recordings and responses will be used for
                  research purposes only
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Withdrawal:</strong> You can withdraw from the study at any time
                  by closing this window
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Duration:</strong> The study typically takes 5-10 minutes to
                  complete
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Test inputs:</strong> You do not need to use real personal or
                  business information when filling out forms. However, please provide some kind of input in the fields
                  to simulate a realistic experience
                </span>
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg">
            <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer select-none">
              I have read and understood the information above. I consent to participate in this study and agree to have
              my screen recorded during the test.
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={onNext} disabled={!consent} className="flex-1" size="lg">
              Begin Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
