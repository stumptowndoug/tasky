"use client"

import { Column as ColumnType, Task } from "@/lib/types"

import { TaskCard } from "./task-card"

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
}

export function Column({ column, tasks }: ColumnProps) {
  return (
    <div className="flex h-full min-w-[320px] max-w-[320px] flex-col rounded-lg bg-muted p-4 dark:bg-muted/30">
      {/* Column Header */}
      <div className="relative mb-4 flex items-center justify-between pb-3 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {column.name}
          </h3>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg bg-card/50 text-sm text-muted-foreground">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
