"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Question, QuestionType } from "@/lib/types"

interface QuestionEditorProps {
  questions: Question[]
  onChange: (next: Question[]) => void
}

function newQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    type: "textarea",
    label: "",
    required: true,
    placeholder: "",
  }
}

export function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  const update = (idx: number, patch: Partial<Question>) => {
    const next = questions.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx))
  }

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= questions.length) return
    const next = [...questions]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  const add = () => onChange([...questions, newQuestion()])

  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No questions yet. Add at least one so participants get a post-test prompt.
        </p>
      )}

      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === questions.length - 1}
                  onClick={() => move(idx, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`q-label-${q.id}`}>Question</Label>
                    <Input
                      id={`q-label-${q.id}`}
                      value={q.label}
                      onChange={(e) => update(idx, { label: e.target.value })}
                      placeholder="e.g. What did you expect to happen next?"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`q-type-${q.id}`}>Type</Label>
                    <Select
                      value={q.type}
                      onValueChange={(v: QuestionType) => update(idx, { type: v })}
                    >
                      <SelectTrigger id={`q-type-${q.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textarea">Long text</SelectItem>
                        <SelectItem value="text">Short text</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {q.type === "scale" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`q-min-${q.id}`}>Min ({q.min ?? 1}) label</Label>
                      <Input
                        id={`q-min-${q.id}`}
                        value={q.minLabel ?? ""}
                        onChange={(e) => update(idx, { minLabel: e.target.value })}
                        placeholder="e.g. Very difficult"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`q-max-${q.id}`}>Max ({q.max ?? 5}) label</Label>
                      <Input
                        id={`q-max-${q.id}`}
                        value={q.maxLabel ?? ""}
                        onChange={(e) => update(idx, { maxLabel: e.target.value })}
                        placeholder="e.g. Very easy"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`q-min-n-${q.id}`}>Min number</Label>
                      <Input
                        id={`q-min-n-${q.id}`}
                        type="number"
                        value={q.min ?? 1}
                        onChange={(e) => update(idx, { min: Number(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`q-max-n-${q.id}`}>Max number</Label>
                      <Input
                        id={`q-max-n-${q.id}`}
                        type="number"
                        value={q.max ?? 5}
                        onChange={(e) => update(idx, { max: Number(e.target.value) || 5 })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor={`q-placeholder-${q.id}`}>Placeholder (optional)</Label>
                    <Input
                      id={`q-placeholder-${q.id}`}
                      value={q.placeholder ?? ""}
                      onChange={(e) => update(idx, { placeholder: e.target.value })}
                      placeholder="Hint shown inside the field"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`q-req-${q.id}`}
                      checked={q.required}
                      onCheckedChange={(v) => update(idx, { required: v })}
                    />
                    <Label htmlFor={`q-req-${q.id}`} className="text-sm">
                      Required
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="w-4 h-4 mr-1" />
        Add question
      </Button>
    </div>
  )
}
