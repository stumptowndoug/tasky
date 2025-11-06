"use client"

import { Task, Column as ColumnType } from "@/lib/types"
import { TaskCard } from "./task-card"

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
}

export function Column({ column, tasks }: ColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">
            {column.name}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  )
}
