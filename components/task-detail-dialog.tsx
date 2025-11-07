"use client"

import { useState } from "react"
import { Task } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!task) return null

  // Extract core fields
  const { id, boardId, title, status, description, createdAt, updatedAt, ...customFields } = task

  // Extract common custom fields
  const priority = customFields.priority as string | undefined
  const tags = customFields.tags as string[] | undefined

  // Get remaining custom fields
  const otherCustomFields = Object.entries(customFields).filter(
    ([key]) => key !== "priority" && key !== "tags"
  )

  const copyTaskId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded font-bold">
              {id}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyTaskId}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            {priority && (
              <Badge variant="outline">
                {priority}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Description */}
          {description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Status</h3>
            <Badge variant="outline">{status}</Badge>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {otherCustomFields.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Custom Fields</h3>
              <div className="space-y-2">
                {otherCustomFields.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <span className="font-medium min-w-[120px]">{key}:</span>
                    <span className="text-muted-foreground break-words">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 mt-4 space-y-1 text-xs text-muted-foreground relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
            <div className="flex items-center gap-2">
              <span className="font-medium">Created:</span>
              <span>{new Date(createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Updated:</span>
              <span>{new Date(updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
