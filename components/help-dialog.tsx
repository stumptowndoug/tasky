"use client"

import { useState } from "react"
import { FileJson, HelpCircle, Sparkles, Terminal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function HelpDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-9">
          <HelpCircle className="size-4" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <DialogTitle>LLM-Powered Task Management</DialogTitle>
          </div>
          <DialogDescription>
            This board is read-only. Manage your tasks using AI assistants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                    <span>"Add a task to research databases"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Move task
                    </Badge>
                    <span>"Move task-123 to done"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Update
                    </Badge>
                    <span>"Update the database task to high priority"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Organize
                    </Badge>
                    <span>"Organize all done tasks from last week"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-2 space-y-1.5 pt-4 text-xs text-muted-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
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

          <div className="relative mt-2 pt-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
            <p className="text-xs text-muted-foreground">
              📖 See{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                docs/LLM_GUIDE.md
              </code>{" "}
              for detailed instructions
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
