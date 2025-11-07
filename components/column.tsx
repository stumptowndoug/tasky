"use client"

import { Task, Column as ColumnType } from "@/lib/types"
import { TaskCard } from "./task-card"

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
}

export function Column({ column, tasks }: ColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[320px] bg-muted dark:bg-muted/30 rounded-lg p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 relative before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            {column.name}
          </h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground bg-card/50 rounded-lg">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
