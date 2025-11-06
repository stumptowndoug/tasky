"use client"

import { Task } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  // Extract core fields
  const { id, boardId, title, status, description, createdAt, updatedAt, ...customFields } = task

  // Extract common custom fields for special display
  const priority = customFields.priority as string | undefined
  const tags = customFields.tags as string[] | undefined

  // Get remaining custom fields (excluding priority and tags)
  const otherCustomFields = Object.entries(customFields).filter(
    ([key]) => key !== "priority" && key !== "tags"
  )

  return (
    <Card className="transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-snug">
            {title}
          </CardTitle>
          {priority && (
            <Badge
              variant={
                priority === "high"
                  ? "destructive"
                  : priority === "medium"
                  ? "default"
                  : "secondary"
              }
              className="shrink-0"
            >
              {priority}
            </Badge>
          )}
        </div>
        {description && (
          <CardDescription className="mt-1.5 text-sm line-clamp-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      {(tags || otherCustomFields.length > 0) && (
        <CardContent className="pb-3 pt-0">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {otherCustomFields.length > 0 && (
            <div className="space-y-1 text-xs text-muted-foreground">
              {otherCustomFields.slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate">{String(value)}</span>
                </div>
              ))}
              {otherCustomFields.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{otherCustomFields.length - 2} more
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
