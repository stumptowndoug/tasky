#!/usr/bin/env node

/**
 * Tasky MCP Server
 *
 * Model Context Protocol server for managing tasks in Tasky.
 * Works with Claude Desktop, Cursor, and other MCP-compatible tools.
 */

// Load environment variables from .env.local or .env
import { readFile, writeFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { config } from "dotenv"

config({ path: [".env.local", ".env"] })

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to tasks.json - supports custom path via environment variable
// Default: mcp-server/dist/index.js -> ../../data/tasks.json
const TASKS_FILE = process.env.TASKS_FILE_PATH
  ? join(__dirname, "../..", process.env.TASKS_FILE_PATH)
  : join(__dirname, "../../data/tasks.json")

/**
 * Read tasks data from file
 */
async function readTasksData() {
  const content = await readFile(TASKS_FILE, "utf-8")
  return JSON.parse(content)
}

/**
 * Write tasks data to file (atomic write)
 */
async function writeTasksData(data: any) {
  data.metadata.lastModified = new Date().toISOString()
  const tempFile = TASKS_FILE + ".tmp"
  await writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8")
  await writeFile(TASKS_FILE, JSON.stringify(data, null, 2), "utf-8")
}

/**
 * Validate that a board exists
 * Returns error object if board doesn't exist, null if valid
 */
function validateBoardExists(data: any, boardId: string) {
  const boardExists = data.boards.some((b: any) => b.id === boardId)

  if (!boardExists) {
    const availableBoards = data.boards
      .map((b: any) => `"${b.id}" (${b.name})`)
      .join(", ")
    return {
      error: `Board "${boardId}" does not exist. Available boards: ${availableBoards}`,
    }
  }

  return null
}

/**
 * Validate that a column exists in a board
 * Returns error object if column doesn't exist, null if valid
 */
function validateColumnExists(data: any, boardId: string, columnId: string) {
  const board = data.boards.find((b: any) => b.id === boardId)

  if (!board) {
    return {
      error: `Board "${boardId}" not found.`,
    }
  }

  const columnExists = board.columns.some((c: any) => c.id === columnId)

  if (!columnExists) {
    const availableColumns = board.columns
      .map((c: any) => `"${c.id}" (${c.name})`)
      .join(", ")
    return {
      error: `Column "${columnId}" does not exist in board "${board.name}". Available columns: ${availableColumns}`,
    }
  }

  return null
}

/**
 * Format boards and columns info for context
 * Returns a formatted string showing all available boards and their columns
 */
function formatBoardsContext(data: any): string {
  const boardsInfo = data.boards
    .map((b: any) => {
      const columns = b.columns
        .sort((a: any, b: any) => a.order - b.order)
        .map((c: any) => c.id)
        .join(", ")
      return `- "${b.id}" (${b.name}): ${columns}`
    })
    .join("\n")

  return `\n\nAvailable boards and columns:\n${boardsInfo}`
}

/**
 * Generate sequential task ID
 * Finds the highest existing task number and increments it
 */
function generateTaskId(existingTasks: any[]) {
  // Extract task numbers from existing IDs (format: task-{number})
  const taskNumbers = existingTasks
    .map((task) => {
      const match = task.id.match(/^task-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((num) => !isNaN(num))

  // Find the highest number, default to 0 if no valid tasks
  const maxNumber = taskNumbers.length > 0 ? Math.max(...taskNumbers) : 0

  // Return next sequential ID
  return `task-${maxNumber + 1}`
}

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: "tasky-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_tasks",
        description:
          "Get all tasks from the board. Returns the complete task list with all fields.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description:
                "Board ID to filter by (optional, defaults to 'default')",
            },
            status: {
              type: "string",
              description: "Filter by status/column (optional)",
            },
          },
        },
      },
      {
        name: "add_task",
        description:
          "Add a new task to the board. Task IDs are automatically generated sequentially (task-1, task-2, etc.). Supports custom fields - any additional properties beyond core fields will be preserved.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID (defaults to 'default')",
            },
            title: {
              type: "string",
              description: "Task title (required)",
            },
            status: {
              type: "string",
              description:
                "Status/column ID (e.g., 'todo', 'in-progress', 'done'). If not specified, uses the first column of the target board.",
            },
            description: {
              type: "string",
              description: "Task description (optional)",
            },
            dueDate: {
              type: "string",
              description:
                "Due date in ISO 8601 format (e.g., '2025-01-15T00:00:00Z' or '2025-01-15') (optional)",
            },
            reminderDate: {
              type: "string",
              description:
                "Reminder date in ISO 8601 format (e.g., '2025-01-14T00:00:00Z' or '2025-01-14') (optional)",
            },
            priority: {
              type: "string",
              description:
                "Priority level: low, medium, high, critical (optional)",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Array of tags (optional)",
            },
            customFields: {
              type: "object",
              description:
                "Any additional custom fields as key-value pairs (optional)",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "update_task",
        description:
          "Update an existing task. Can update any field including custom fields.",
        inputSchema: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "Task ID to update (required)",
            },
            title: {
              type: "string",
              description: "New title (optional)",
            },
            status: {
              type: "string",
              description: "New status/column (optional)",
            },
            description: {
              type: "string",
              description: "New description (optional)",
            },
            dueDate: {
              type: "string",
              description:
                "New due date in ISO 8601 format (e.g., '2025-01-15T00:00:00Z' or '2025-01-15') (optional)",
            },
            reminderDate: {
              type: "string",
              description:
                "New reminder date in ISO 8601 format (e.g., '2025-01-14T00:00:00Z' or '2025-01-14') (optional)",
            },
            priority: {
              type: "string",
              description: "New priority (optional)",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "New tags array (optional)",
            },
            customFields: {
              type: "object",
              description: "Update or add custom fields (optional)",
            },
          },
          required: ["taskId"],
        },
      },
      {
        name: "delete_task",
        description: "Delete a task by ID.",
        inputSchema: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "Task ID to delete (required)",
            },
          },
          required: ["taskId"],
        },
      },
      {
        name: "move_task",
        description: "Move a task to a different column/status.",
        inputSchema: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "Task ID to move (required)",
            },
            status: {
              type: "string",
              description:
                "Target status/column (e.g., 'todo', 'in-progress', 'done') (required)",
            },
          },
          required: ["taskId", "status"],
        },
      },
      {
        name: "get_boards",
        description: "Get all boards and their columns.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_tasks",
        description: "Search tasks by text in title or description.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (required)",
            },
            boardId: {
              type: "string",
              description: "Board ID to search in (optional)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "add_column",
        description: "Add a new column to a board.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID (defaults to 'default')",
            },
            columnId: {
              type: "string",
              description:
                "Unique column ID (e.g., 'review', 'testing') (required)",
            },
            name: {
              type: "string",
              description: "Display name for the column (required)",
            },
            order: {
              type: "number",
              description: "Order position (optional, defaults to end of list)",
            },
          },
          required: ["columnId", "name"],
        },
      },
      {
        name: "update_column",
        description: "Update a column's properties (name and/or order).",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID (defaults to 'default')",
            },
            columnId: {
              type: "string",
              description: "Column ID to update (required)",
            },
            name: {
              type: "string",
              description: "New display name (optional)",
            },
            order: {
              type: "number",
              description: "New order position (optional)",
            },
          },
          required: ["columnId"],
        },
      },
      {
        name: "delete_column",
        description:
          "Delete a column from a board. Note: This will not delete tasks in that column, but orphaned tasks won't be visible.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID (defaults to 'default')",
            },
            columnId: {
              type: "string",
              description: "Column ID to delete (required)",
            },
          },
          required: ["columnId"],
        },
      },
      {
        name: "update_board",
        description: "Update board properties like the board name.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID (defaults to 'default')",
            },
            name: {
              type: "string",
              description: "New board name (required)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "add_board",
        description:
          "Create a new board with default columns (todo, in-progress, done). You can customize columns afterward.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description:
                "Unique board ID (e.g., 'project-alpha', 'personal') (required)",
            },
            name: {
              type: "string",
              description: "Display name for the board (required)",
            },
          },
          required: ["boardId", "name"],
        },
      },
      {
        name: "delete_board",
        description:
          "Delete a board and all its tasks. This action cannot be undone.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "Board ID to delete (required)",
            },
          },
          required: ["boardId"],
        },
      },
    ],
  }
})

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (!args) {
    return {
      content: [{ type: "text", text: "No arguments provided" }],
      isError: true,
    }
  }

  try {
    switch (name) {
      case "get_tasks": {
        const data = await readTasksData()
        let tasks = data.tasks

        // Filter by board if specified
        if (args.boardId) {
          tasks = tasks.filter((t: any) => t.boardId === args.boardId)
        } else {
          tasks = tasks.filter((t: any) => t.boardId === "default")
        }

        // Filter by status if specified
        if (args.status) {
          tasks = tasks.filter((t: any) => t.status === args.status)
        }

        return {
          content: [
            {
              type: "text",
              text: `${JSON.stringify(tasks, null, 2)}${formatBoardsContext(
                data
              )}`,
            },
          ],
        }
      }

      case "add_task": {
        const data = await readTasksData()
        const boardId = String(args.boardId || "default")

        // Validate board exists
        const boardValidationError = validateBoardExists(data, boardId)
        if (boardValidationError) {
          return {
            content: [
              {
                type: "text",
                text: boardValidationError.error,
              },
            ],
            isError: true,
          }
        }

        // Default to first column of the target board if status not provided
        let status: string
        if (args.status) {
          status = String(args.status)
        } else {
          const board = data.boards.find((b: any) => b.id === boardId)
          const firstColumn = board.columns.sort(
            (a: any, b: any) => a.order - b.order
          )[0]
          status = firstColumn.id
        }

        // Validate column exists
        const columnValidationError = validateColumnExists(
          data,
          boardId,
          status
        )
        if (columnValidationError) {
          return {
            content: [
              {
                type: "text",
                text: columnValidationError.error,
              },
            ],
            isError: true,
          }
        }

        const newTask: any = {
          id: generateTaskId(data.tasks),
          boardId: boardId,
          title: args.title,
          status: status,
          description: args.description || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        if (args.dueDate) newTask.dueDate = args.dueDate
        if (args.reminderDate) newTask.reminderDate = args.reminderDate
        if (args.priority) newTask.priority = args.priority
        if (args.tags) newTask.tags = args.tags
        if (args.customFields && typeof args.customFields === "object") {
          Object.assign(newTask, args.customFields)
        }

        data.tasks.push(newTask)
        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Task created successfully!\n\n${JSON.stringify(
                newTask,
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "update_task": {
        const data = await readTasksData()
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId)

        if (taskIndex === -1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Task with ID "${args.taskId}" not found.`,
              },
            ],
            isError: true,
          }
        }

        // Validate column if status is being updated
        if (args.status !== undefined) {
          const taskBoardId = data.tasks[taskIndex].boardId || "default"
          const columnValidationError = validateColumnExists(
            data,
            taskBoardId,
            String(args.status)
          )
          if (columnValidationError) {
            return {
              content: [
                {
                  type: "text",
                  text: columnValidationError.error,
                },
              ],
              isError: true,
            }
          }
        }

        const updates: any = {
          updatedAt: new Date().toISOString(),
        }

        if (args.title !== undefined) updates.title = args.title
        if (args.status !== undefined) updates.status = args.status
        if (args.description !== undefined)
          updates.description = args.description
        if (args.dueDate !== undefined) updates.dueDate = args.dueDate
        if (args.reminderDate !== undefined)
          updates.reminderDate = args.reminderDate
        if (args.priority !== undefined) updates.priority = args.priority
        if (args.tags !== undefined) updates.tags = args.tags
        if (args.customFields) {
          Object.assign(updates, args.customFields)
        }

        data.tasks[taskIndex] = {
          ...data.tasks[taskIndex],
          ...updates,
        }

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Task updated successfully!\n\n${JSON.stringify(
                data.tasks[taskIndex],
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "delete_task": {
        const data = await readTasksData()
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId)

        if (taskIndex === -1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Task with ID "${args.taskId}" not found.`,
              },
            ],
            isError: true,
          }
        }

        const deletedTask = data.tasks[taskIndex]
        data.tasks.splice(taskIndex, 1)
        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Task deleted successfully!\n\nDeleted task: ${
                deletedTask.title
              }${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "move_task": {
        const data = await readTasksData()
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId)

        if (taskIndex === -1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Task with ID "${args.taskId}" not found.`,
              },
            ],
            isError: true,
          }
        }

        // Validate column exists in task's board
        const taskBoardId = data.tasks[taskIndex].boardId || "default"
        const columnValidationError = validateColumnExists(
          data,
          taskBoardId,
          String(args.status)
        )
        if (columnValidationError) {
          return {
            content: [
              {
                type: "text",
                text: columnValidationError.error,
              },
            ],
            isError: true,
          }
        }

        data.tasks[taskIndex].status = args.status
        data.tasks[taskIndex].updatedAt = new Date().toISOString()

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Task moved successfully!\n\n${
                data.tasks[taskIndex].title
              } → ${args.status}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "get_boards": {
        const data = await readTasksData()

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.boards, null, 2),
            },
          ],
        }
      }

      case "search_tasks": {
        const data = await readTasksData()
        const query = String(args.query || "").toLowerCase()
        let tasks = data.tasks

        if (args.boardId) {
          tasks = tasks.filter((t: any) => t.boardId === args.boardId)
        }

        const results = tasks.filter((t: any) => {
          const titleMatch = t.title.toLowerCase().includes(query)
          const descMatch = t.description?.toLowerCase().includes(query)
          return titleMatch || descMatch
        })

        return {
          content: [
            {
              type: "text",
              text: `Found ${results.length} task(s):\n\n${JSON.stringify(
                results,
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "add_column": {
        const data = await readTasksData()
        const boardId = String(args.boardId || "default")

        // Validate board exists
        const validationError = validateBoardExists(data, boardId)
        if (validationError) {
          return {
            content: [
              {
                type: "text",
                text: validationError.error,
              },
            ],
            isError: true,
          }
        }

        const boardIndex = data.boards.findIndex((b: any) => b.id === boardId)

        // Check if column ID already exists
        const existingColumn = data.boards[boardIndex].columns.find(
          (c: any) => c.id === args.columnId
        )
        if (existingColumn) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Column with ID "${args.columnId}" already exists.`,
              },
            ],
            isError: true,
          }
        }

        const newColumn = {
          id: args.columnId,
          name: args.name,
          order:
            args.order !== undefined
              ? args.order
              : data.boards[boardIndex].columns.length,
        }

        data.boards[boardIndex].columns.push(newColumn)

        // Sort columns by order
        data.boards[boardIndex].columns.sort(
          (a: any, b: any) => a.order - b.order
        )

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Column added successfully!\n\n${JSON.stringify(
                newColumn,
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "update_column": {
        const data = await readTasksData()
        const boardId = String(args.boardId || "default")

        // Validate board exists
        const validationError = validateBoardExists(data, boardId)
        if (validationError) {
          return {
            content: [
              {
                type: "text",
                text: validationError.error,
              },
            ],
            isError: true,
          }
        }

        const boardIndex = data.boards.findIndex((b: any) => b.id === boardId)

        const columnIndex = data.boards[boardIndex].columns.findIndex(
          (c: any) => c.id === args.columnId
        )

        if (columnIndex === -1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Column with ID "${args.columnId}" not found.`,
              },
            ],
            isError: true,
          }
        }

        if (args.name !== undefined) {
          data.boards[boardIndex].columns[columnIndex].name = args.name
        }

        if (args.order !== undefined) {
          data.boards[boardIndex].columns[columnIndex].order = args.order
          // Sort columns by order
          data.boards[boardIndex].columns.sort(
            (a: any, b: any) => a.order - b.order
          )
        }

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Column updated successfully!\n\n${JSON.stringify(
                data.boards[boardIndex].columns[columnIndex],
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "delete_column": {
        const data = await readTasksData()
        const boardId = String(args.boardId || "default")

        // Validate board exists
        const validationError = validateBoardExists(data, boardId)
        if (validationError) {
          return {
            content: [
              {
                type: "text",
                text: validationError.error,
              },
            ],
            isError: true,
          }
        }

        const boardIndex = data.boards.findIndex((b: any) => b.id === boardId)

        const columnIndex = data.boards[boardIndex].columns.findIndex(
          (c: any) => c.id === args.columnId
        )

        if (columnIndex === -1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Column with ID "${args.columnId}" not found.`,
              },
            ],
            isError: true,
          }
        }

        const deletedColumn = data.boards[boardIndex].columns[columnIndex]
        data.boards[boardIndex].columns.splice(columnIndex, 1)

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Column deleted successfully!\n\nDeleted: ${
                deletedColumn.name
              } (${deletedColumn.id})${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "update_board": {
        const data = await readTasksData()
        const boardId = String(args.boardId || "default")

        // Validate board exists
        const validationError = validateBoardExists(data, boardId)
        if (validationError) {
          return {
            content: [
              {
                type: "text",
                text: validationError.error,
              },
            ],
            isError: true,
          }
        }

        const boardIndex = data.boards.findIndex((b: any) => b.id === boardId)

        data.boards[boardIndex].name = args.name

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Board updated successfully!\n\n${JSON.stringify(
                data.boards[boardIndex],
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "add_board": {
        const data = await readTasksData()

        // Check if board ID already exists
        const existingBoard = data.boards.find(
          (b: any) => b.id === args.boardId
        )
        if (existingBoard) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Board with ID "${args.boardId}" already exists.`,
              },
            ],
            isError: true,
          }
        }

        const newBoard = {
          id: args.boardId,
          name: args.name,
          columns: [
            {
              id: "todo",
              name: "To Do",
              order: 0,
            },
            {
              id: "in-progress",
              name: "In Progress",
              order: 1,
            },
            {
              id: "done",
              name: "Done",
              order: 2,
            },
          ],
        }

        data.boards.push(newBoard)

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Board created successfully!\n\n${JSON.stringify(
                newBoard,
                null,
                2
              )}${formatBoardsContext(data)}`,
            },
          ],
        }
      }

      case "delete_board": {
        const data = await readTasksData()

        // Validate board exists
        const validationError = validateBoardExists(data, String(args.boardId))
        if (validationError) {
          return {
            content: [
              {
                type: "text",
                text: validationError.error,
              },
            ],
            isError: true,
          }
        }

        const boardIndex = data.boards.findIndex(
          (b: any) => b.id === args.boardId
        )

        // Prevent deleting the default board if it's the only one
        if (data.boards.length === 1) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Cannot delete the only remaining board.`,
              },
            ],
            isError: true,
          }
        }

        const deletedBoard = data.boards[boardIndex]

        // Delete the board
        data.boards.splice(boardIndex, 1)

        // Delete all tasks associated with this board
        const tasksBeforeCount = data.tasks.length
        data.tasks = data.tasks.filter((t: any) => t.boardId !== args.boardId)
        const tasksDeletedCount = tasksBeforeCount - data.tasks.length

        await writeTasksData(data)

        return {
          content: [
            {
              type: "text",
              text: `Board deleted successfully!\n\nDeleted: ${
                deletedBoard.name
              } (${
                deletedBoard.id
              })\nTasks deleted: ${tasksDeletedCount}${formatBoardsContext(
                data
              )}`,
            },
          ],
        }
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        }
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    }
  }
})

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Tasky MCP server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
