"use client"

import { useState } from "react"
import { Bell, Calendar, Check, Copy } from "lucide-react"

import { getRelativeDateString, isTaskOverdue } from "@/lib/calendar-utils"
import { Task } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!task) return null

  // Extract core fields
  const {
    id,
    boardId,
    title,
    status,
    description,
    dueDate,
    reminderDate,
    createdAt,
    updatedAt,
    ...customFields
  } = task

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
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-3 flex items-center gap-2">
            <code className="rounded bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
              {id}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyTaskId}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
            {priority && <Badge variant="outline">{priority}</Badge>}
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Description */}
          {description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Status</h3>
            <Badge variant="outline">{status}</Badge>
          </div>

          {/* Dates */}
          {(dueDate || reminderDate) && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Dates</h3>
              <div className="space-y-2">
                {dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Due:</span>
                    <span
                      className={`text-sm ${
                        isTaskOverdue(task)
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getRelativeDateString(dueDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({new Date(dueDate).toLocaleDateString()})
                    </span>
                  </div>
                )}
                {reminderDate && (
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Reminder:</span>
                    <span className="text-sm text-muted-foreground">
                      {getRelativeDateString(reminderDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({new Date(reminderDate).toLocaleDateString()})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Tags</h3>
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
              <h3 className="mb-2 text-sm font-semibold">Custom Fields</h3>
              <div className="space-y-2">
                {otherCustomFields.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-sm">
                    <span className="min-w-[120px] font-medium">{key}:</span>
                    <span className="break-words text-muted-foreground">
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
          <div className="relative mt-4 space-y-1 pt-4 text-xs text-muted-foreground before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
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
