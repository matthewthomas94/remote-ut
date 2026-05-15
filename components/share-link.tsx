"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShareLinkProps {
  testId: string
}

export function ShareLink({ testId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false)

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${testId}`
      : `/t/${testId}`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("[share-link] copy failed", err)
    }
  }

  return (
    <div className="flex gap-2">
      <Input readOnly value={link} className="font-mono text-sm" />
      <Button type="button" variant="outline" onClick={onCopy} className="shrink-0">
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  )
}
