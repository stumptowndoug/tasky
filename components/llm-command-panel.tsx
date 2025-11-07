"use client"

import { FileJson, Sparkles, Terminal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LLMCommandPanel() {
  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <CardTitle className="text-lg">LLM-Powered Task Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This board is <strong>read-only</strong>. Manage your tasks using AI
          assistants like Claude Code or Cursor.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <FileJson className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Data Location</p>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                data/tasks.json
              </code>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Terminal className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex-1 space-y-2">
              <p className="font-medium">Quick Commands</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Add task
                  </Badge>
                  <span>&quot;Add a task to research databases&quot;</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Move task
                  </Badge>
                  <span>&quot;Move task-123 to done&quot;</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Update
                  </Badge>
                  <span>
                    &quot;Update the database task to high priority&quot;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Organize
                  </Badge>
                  <span>
                    &quot;Organize all done tasks from last week&quot;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 border-t pt-2 text-xs text-muted-foreground">
          <p>
            <strong>Using Claude Code:</strong> Simply ask me to manage your
            tasks
          </p>
          <p>
            <strong>Using Cursor:</strong> Ask Cursor AI in the chat panel
          </p>
          <p>
            <strong>Manual Edit:</strong> Open{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              data/tasks.json
            </code>{" "}
            in your editor
          </p>
        </div>

        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground">
            📖 See{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              docs/LLM_GUIDE.md
            </code>{" "}
            for detailed instructions
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
