/**
 * Core type definitions for Tasky
 *
 * These types define the structure of boards, columns, and tasks.
 * Tasks support custom fields - any additional properties beyond the core fields
 * will be treated as custom fields and displayed in the UI.
 */

/**
 * Column definition within a board
 */
export interface Column {
  id: string
  name: string
  order: number
}

/**
 * Board definition containing columns
 */
export interface Board {
  id: string
  name: string
  columns: Column[]
}

/**
 * Core task fields that are required or commonly used
 */
export interface Task {
  id: string
  boardId: string
  title: string
  status: string // Column ID
  description?: string
  dueDate?: string // ISO date string - when the task should be completed
  reminderDate?: string // ISO date string - when to remind about the task
  createdAt: string
  updatedAt: string
  // Custom fields: Any additional properties are allowed
  [key: string]: any
}

/**
 * Metadata about the data file
 */
export interface Metadata {
  version: string
  lastModified: string
}

/**
 * Root data structure for tasks.json
 */
export interface TasksData {
  boards: Board[]
  tasks: Task[]
  metadata: Metadata
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Request types for creating/updating tasks
 */
export interface CreateTaskRequest {
  boardId: string
  title: string
  status: string
  description?: string
  [key: string]: any // Allow custom fields
}

export interface UpdateTaskRequest {
  id: string
  title?: string
  status?: string
  description?: string
  [key: string]: any // Allow custom fields
}

/**
 * Request types for creating/updating boards
 */
export interface CreateBoardRequest {
  name: string
  columns: Omit<Column, "id">[]
}

export interface UpdateBoardRequest {
  id: string
  name?: string
  columns?: Column[]
}
