/**
 * File system utilities for reading and writing tasks.json
 *
 * These utilities handle all file operations for the tasks data.
 * They ensure atomic writes and proper error handling.
 */

import { promises as fs } from "fs"
import path from "path"
import type {
  TasksData,
  Task,
  Board,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateBoardRequest,
  UpdateBoardRequest,
} from "./types"

// Get tasks file path from environment variable or use default
// This allows you to use a different file for personal tasks
const TASKS_FILE_PATH = process.env.TASKS_FILE_PATH
  ? path.join(process.cwd(), process.env.TASKS_FILE_PATH)
  : path.join(process.cwd(), "data", "tasks.json")

/**
 * Read tasks data from file
 */
export async function readTasksData(): Promise<TasksData> {
  try {
    const fileContents = await fs.readFile(TASKS_FILE_PATH, "utf8")
    return JSON.parse(fileContents)
  } catch (error) {
    console.error("Error reading tasks file:", error)
    throw new Error("Failed to read tasks data")
  }
}

/**
 * Write tasks data to file
 * Uses atomic write with temp file to prevent corruption
 */
export async function writeTasksData(data: TasksData): Promise<void> {
  try {
    // Update metadata
    data.metadata.lastModified = new Date().toISOString()

    // Write to temp file first
    const tempPath = TASKS_FILE_PATH + ".tmp"
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8")

    // Atomic rename
    await fs.rename(tempPath, TASKS_FILE_PATH)
  } catch (error) {
    console.error("Error writing tasks file:", error)
    throw new Error("Failed to write tasks data")
  }
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  const data = await readTasksData()
  return data.tasks
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const data = await readTasksData()
  return data.tasks.find((task) => task.id === id) || null
}

/**
 * Create a new task
 */
export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  const data = await readTasksData()

  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  data.tasks.push(newTask)
  await writeTasksData(data)

  return newTask
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  updates: Partial<UpdateTaskRequest>
): Promise<Task | null> {
  const data = await readTasksData()
  const taskIndex = data.tasks.findIndex((task) => task.id === id)

  if (taskIndex === -1) {
    return null
  }

  data.tasks[taskIndex] = {
    ...data.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await writeTasksData(data)
  return data.tasks[taskIndex]
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const data = await readTasksData()
  const taskIndex = data.tasks.findIndex((task) => task.id === id)

  if (taskIndex === -1) {
    return false
  }

  data.tasks.splice(taskIndex, 1)
  await writeTasksData(data)

  return true
}

/**
 * Get all boards
 */
export async function getBoards(): Promise<Board[]> {
  const data = await readTasksData()
  return data.boards
}

/**
 * Get a single board by ID
 */
export async function getBoardById(id: string): Promise<Board | null> {
  const data = await readTasksData()
  return data.boards.find((board) => board.id === id) || null
}

/**
 * Create a new board
 */
export async function createBoard(boardData: CreateBoardRequest): Promise<Board> {
  const data = await readTasksData()

  const newBoard: Board = {
    id: `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: boardData.name,
    columns: boardData.columns.map((col, index) => ({
      id: `col-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      name: col.name,
      order: col.order,
    })),
  }

  data.boards.push(newBoard)
  await writeTasksData(data)

  return newBoard
}

/**
 * Update an existing board
 */
export async function updateBoard(
  id: string,
  updates: Partial<UpdateBoardRequest>
): Promise<Board | null> {
  const data = await readTasksData()
  const boardIndex = data.boards.findIndex((board) => board.id === id)

  if (boardIndex === -1) {
    return null
  }

  data.boards[boardIndex] = {
    ...data.boards[boardIndex],
    ...updates,
  }

  await writeTasksData(data)
  return data.boards[boardIndex]
}

/**
 * Delete a board and all its tasks
 */
export async function deleteBoard(id: string): Promise<boolean> {
  const data = await readTasksData()
  const boardIndex = data.boards.findIndex((board) => board.id === id)

  if (boardIndex === -1) {
    return false
  }

  // Remove board
  data.boards.splice(boardIndex, 1)

  // Remove all tasks associated with this board
  data.tasks = data.tasks.filter((task) => task.boardId !== id)

  await writeTasksData(data)
  return true
}
