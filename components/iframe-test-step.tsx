"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface IframeTestStepProps {
  prototypeUrl: string
  isRecording: boolean
  recordingError: string | null
  logEvent: (type: string, value?: unknown) => void
  onComplete: (terminal?: string) => void
}

export function IframeTestStep({
  prototypeUrl,
  isRecording,
  recordingError,
  logEvent,
  onComplete,
}: IframeTestStepProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loadTimedOut, setLoadTimedOut] = useState(false)

  useEffect(() => {
    logEvent("iframe_load_started", { url: prototypeUrl })
    const t = setTimeout(() => {
      if (!loaded) {
        setLoadTimedOut(true)
        logEvent("iframe_load_timeout", { url: prototypeUrl })
      }
    }, 8000)
    return () => clearTimeout(t)
    // logEvent is stable, prototypeUrl won't change during a session — safe deps list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-end via postMessage from the prototype is the ONLY way to end the
  // test — there is no manual escape hatch. Contract:
  //   window.parent.postMessage({ type: 'remote-ut-end', terminal: '<label>' }, '*')
  // Only accept messages from our own iframe element — other frames or browser
  // extensions sending the same shape are ignored. `terminal` is optional; if
  // omitted, we record "default".
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const iframe = iframeRef.current
      if (!iframe || event.source !== iframe.contentWindow) return
      const data = event.data
      if (!data || typeof data !== "object") return
      if (data.type !== "remote-ut-end") return
      const terminal = typeof data.terminal === "string" ? data.terminal : "default"
      logEvent("prototype_auto_end", { terminal })
      onComplete(terminal)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [logEvent, onComplete])

  const handleLoad = () => {
    setLoaded(true)
    setLoadTimedOut(false)
    logEvent("iframe_loaded", { url: prototypeUrl })
  }

  return (
    <div className="fixed inset-0 bg-background">
      {isRecording && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Recording Active
        </div>
      )}

      {recordingError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{recordingError}</AlertDescription>
          </Alert>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={prototypeUrl}
        title="Prototype"
        className="absolute inset-0 w-full h-full border-0"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals"
        allow="clipboard-write; clipboard-read"
        onLoad={handleLoad}
      />

      {loadTimedOut && !loaded && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 p-6">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>This prototype didn't load</AlertTitle>
            <AlertDescription>
              The site may have blocked embedding (e.g. via <code>X-Frame-Options</code> or a{" "}
              <code>frame-ancestors</code> CSP). Please contact the person who sent you this link.
              You can close this tab.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
