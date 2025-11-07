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
        <Button variant="outline" size="icon" className="h-9 w-9">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>LLM-Powered Task Management</DialogTitle>
          </div>
          <DialogDescription>
            This board is read-only. Manage your tasks using AI assistants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <FileJson className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Data Location</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  data/tasks.json
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Terminal className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div className="space-y-2 flex-1">
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

          <div className="pt-4 mt-2 space-y-1.5 text-xs text-muted-foreground relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
            <p>
              <strong>Using Claude Code:</strong> Simply ask me to manage your
              tasks
            </p>
            <p>
              <strong>Using Cursor:</strong> Ask Cursor AI in the chat panel
            </p>
            <p>
              <strong>Manual Edit:</strong> Open{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                data/tasks.json
              </code>{" "}
              in your editor
            </p>
          </div>

          <div className="pt-4 mt-2 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
            <p className="text-xs text-muted-foreground">
              📖 See{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
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
