"use client"

import { useEffect, useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"

import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  type Feature,
} from "@/components/ui/shadcn-io/calendar"
import { TasksData } from "@/lib/types"
import { tasksToCalendarFeatures, isTaskOverdue, hasUpcomingReminder } from "@/lib/calendar-utils"
import { HelpDialog } from "@/components/help-dialog"
import { TaskDetailDialog } from "@/components/task-detail-dialog"
import { BoardLegend } from "@/components/board-legend"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [data, setData] = useState<TasksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch tasks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Setup SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/watch")

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data)

      if (eventData.type === "file-changed") {
        // File changed, refetch data
        fetchData()
      }
    }

    eventSource.onerror = () => {
      console.error("SSE connection error")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  if (loading) {
    return (
      <section className="container py-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container py-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="container py-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </section>
    )
  }

  // Transform tasks to calendar features
  const features = tasksToCalendarFeatures(data.tasks, data.boards)

  // Get the current year for year picker range
  const currentYear = new Date().getFullYear()

  // Get the selected task
  const selectedTask = selectedTaskId ? data.tasks.find(t => t.id === selectedTaskId) : null

  return (
    <section className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-6" />
          <h1 className="text-2xl font-bold">Calendar View</h1>
        </div>
        <HelpDialog />
      </div>

      {/* Board Legend */}
      <div className="mb-6">
        <BoardLegend boards={data.boards} />
      </div>

      {/* Info message if no tasks with dates */}
      {features.length === 0 && (
        <div className="mb-6 rounded-lg border border-dashed p-8 text-center">
          <CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tasks scheduled</h3>
          <p className="text-sm text-muted-foreground">
            Tasks with due dates will appear on the calendar. Add a due date to a task to see it here.
          </p>
        </div>
      )}

      {/* Calendar */}
      <CalendarProvider className="rounded-lg border">
        <CalendarDate>
          <CalendarDatePicker>
            <CalendarMonthPicker />
            <CalendarYearPicker start={currentYear - 5} end={currentYear + 5} />
          </CalendarDatePicker>
          <CalendarDatePagination />
        </CalendarDate>
        <CalendarHeader />
        <CalendarBody features={features}>
          {({ feature }) => {
            // Access the original task data
            const task = (feature as Feature & { task: any }).task

            return (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-accent",
                  isTaskOverdue(task) && "text-destructive",
                  hasUpcomingReminder(task) && "font-medium"
                )}
                onClick={() => {
                  setSelectedTaskId(task.id)
                  setIsDialogOpen(true)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedTaskId(task.id)
                    setIsDialogOpen(true)
                  }
                }}
              >
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: feature.status.color,
                  }}
                />
                <span className="truncate text-xs">{feature.name}</span>
                {hasUpcomingReminder(task) && (
                  <span className="shrink-0 text-xs">🔔</span>
                )}
              </div>
            )
          }}
        </CalendarBody>
      </CalendarProvider>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask || null}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setSelectedTaskId(null)
          }
        }}
      />
    </section>
  )
}
