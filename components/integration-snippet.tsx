"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IntegrationSnippetProps {
  testTitle?: string
}

const SNIPPET = `// Fire once when the participant reaches a terminal screen of your prototype.
// 'terminal' is any short label that describes which terminal they hit
// (e.g. 'done', 'contact-support'). It will show up in the dashboard.
window.parent.postMessage(
  { type: 'remote-ut-end', terminal: 'done' },
  '*'
)`

function buildAiPrompt(testTitle?: string) {
  const titleLine = testTitle ? `\nThe test is titled: **${testTitle}**\n` : ""
  return `I'm running a usability test of this prototype with [remote-ut], a screen-recording tool. remote-ut loads my prototype inside an iframe, captures the participant's screen, and shows a follow-up questionnaire when the test ends.
${titleLine}
**This integration is required.** remote-ut has no manual end-test button — the prototype itself is the only thing that can end a test. If this isn't wired up, participants will get stuck on the prototype forever and never reach the questionnaire.

The contract is:

\`\`\`js
window.parent.postMessage({ type: 'remote-ut-end', terminal: '<label>' }, '*')
\`\`\`

Fire it **once, on mount** of each terminal screen (e.g. inside a \`useEffect\` with an empty dep array if this is a React app). It must not fire repeatedly or while the participant is still mid-flow.

Please:
1. Identify every screen / route / state in this codebase that is a terminal state — i.e. the participant has finished the task once they arrive there. Branching flows usually have more than one terminal. Don't miss any; a missed terminal means participants who go down that branch can't complete the test.
2. Pick a short, descriptive label for each terminal (e.g. \`done\`, \`contact-support\`, \`abandoned-checkout\`). Lower-case, hyphen-separated, no spaces.
3. Wire each terminal up with the \`postMessage\` call above, using the matching label.
4. Make sure each call only fires when the participant actually arrives at that screen, not during transitions away from it.
5. Show me where you placed each call so I can verify, and list the terminal labels you chose so I know what to expect to see in the remote-ut dashboard.`
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("[copy] failed", err)
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={onCopy}>
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 mr-1" />
          {label}
        </>
      )}
    </Button>
  )
}

export function IntegrationSnippet({ testTitle }: IntegrationSnippetProps) {
  const aiPrompt = useMemo(() => buildAiPrompt(testTitle), [testTitle])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your prototype must call this snippet on every terminal screen — it's the only signal that
        ends the test and reveals the questionnaire. The <code>terminal</code> label you pass is
        what shows up in the sessions table, so use a different label per terminal if your flow
        branches.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Snippet to add to each terminal screen</h4>
          <CopyButton value={SNIPPET} label="Copy snippet" />
        </div>
        <pre className="text-xs bg-zinc-950 text-zinc-100 rounded p-3 overflow-x-auto">
          <code>{SNIPPET}</code>
        </pre>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI prompt
          </h4>
          <CopyButton value={aiPrompt} label="Copy AI prompt" />
        </div>
        <p className="text-xs text-muted-foreground">
          Paste this into Claude / Cursor / Codex inside your prototype's codebase. It explains the
          protocol and asks the AI to identify terminal screens and wire each one up for you.
        </p>
        <pre className="text-xs bg-muted rounded p-3 overflow-x-auto max-h-72 whitespace-pre-wrap">
          <code>{aiPrompt}</code>
        </pre>
      </div>
    </div>
  )
}
