"use client"

import { useState } from "react"
import { Task } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { TaskDetailDialog } from "./task-detail-dialog"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Extract core fields
  const { id, boardId, title, status, description, createdAt, updatedAt, ...customFields } = task

  // Extract common custom fields for special display
  const priority = customFields.priority as string | undefined
  const tags = customFields.tags as string[] | undefined

  // Get remaining custom fields (excluding priority and tags)
  const otherCustomFields = Object.entries(customFields).filter(
    ([key]) => key !== "priority" && key !== "tags"
  )

  const copyTaskId = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Card className="transition-all h-[180px] flex flex-col overflow-hidden hover:shadow-lg">
        {/* Card Content - Clickable */}
        <div className="flex-1 flex flex-col overflow-hidden cursor-pointer" onClick={() => setIsOpen(true)}>
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-base font-medium leading-snug line-clamp-2 flex-1">
                {title}
              </CardTitle>
              {priority && (
                <Badge variant="outline" className="shrink-0">
                  {priority}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="mt-1.5 text-sm line-clamp-3">
                {description}
              </CardDescription>
            )}
          </CardHeader>

          {(tags || otherCustomFields.length > 0) && (
            <CardContent className="pb-3 pt-0 flex-shrink-0">
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {otherCustomFields.length > 0 && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {otherCustomFields.slice(0, 1).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-medium">{key}:</span>
                      <span className="truncate">{String(value)}</span>
                    </div>
                  ))}
                  {otherCustomFields.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      +{otherCustomFields.length - 1} more field{otherCustomFields.length > 2 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </div>

        {/* Task ID Bar - Full width at bottom */}
        <div className="bg-card px-3 py-2 flex items-center justify-between border-t border-border flex-shrink-0">
          <code className="text-xs font-bold tracking-wide" style={{ color: 'hsl(191.6 91.4% 36.5%)' }}>
            {id}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyTaskId}
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
            {copied ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <Copy className="h-3 w-3 text-primary/70" />
            )}
          </Button>
        </div>
      </Card>

      <TaskDetailDialog task={task} open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
