/**
 * Calendar utilities for transforming tasks into calendar features
 */

import type { Feature, Status } from "@/components/ui/shadcn-io/calendar"

import { getBoardColor, getBoardColorHex } from "./board-colors"
import { Board, Task } from "./types"

/**
 * Transform tasks into calendar features
 * Only includes tasks with a dueDate
 */
export function tasksToCalendarFeatures(
  tasks: Task[],
  boards: Board[]
): Feature[] {
  return tasks
    .filter((task) => task.dueDate) // Only show tasks with due dates
    .map((task) => {
      const board = boards.find((b) => b.id === task.boardId)
      const boardColor = getBoardColor(task.boardId)

      return {
        id: task.id,
        name: task.title,
        startAt: new Date(task.dueDate!),
        endAt: new Date(task.dueDate!), // Single-day events
        status: {
          id: task.boardId,
          name: board?.name || task.boardId,
          color: boardColor.hex,
        } as Status,
        // Store additional task data for rendering
        task, // Keep reference to original task
      } as Feature & { task: Task }
    })
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false

  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today

  return dueDate < today && task.status !== "done"
}

/**
 * Check if a task has an upcoming reminder
 */
export function hasUpcomingReminder(task: Task): boolean {
  if (!task.reminderDate) return false

  const reminderDate = new Date(task.reminderDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  return reminderDate >= today && reminderDate <= threeDaysFromNow
}

/**
 * Get relative date string (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function getRelativeDateString(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

  // For dates further out, return formatted date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/**
 * Parse date from input field and return ISO string
 */
export function parseDateFromInput(inputValue: string): string | undefined {
  if (!inputValue) return undefined

  const date = new Date(inputValue)
  if (isNaN(date.getTime())) return undefined

  return date.toISOString()
}

/**
 * Get board legend data for display
 */
export function getBoardLegend(boards: Board[]): Array<{
  id: string
  name: string
  color: string
  colorName: string
}> {
  return boards.map((board) => {
    const colorInfo = getBoardColor(board.id)
    return {
      id: board.id,
      name: board.name,
      color: colorInfo.hex,
      colorName: colorInfo.name,
    }
  })
}
