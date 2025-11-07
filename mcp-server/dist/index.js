#!/usr/bin/env node
/**
 * Tasky MCP Server
 *
 * Model Context Protocol server for managing tasks in Tasky.
 * Works with Claude Desktop, Cursor, and other MCP-compatible tools.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path to tasks.json (relative to this file: mcp-server/dist/index.js -> ../../data/tasks.json)
const TASKS_FILE = join(__dirname, "../../data/tasks.json");
/**
 * Read tasks data from file
 */
async function readTasksData() {
    const content = await readFile(TASKS_FILE, "utf-8");
    return JSON.parse(content);
}
/**
 * Write tasks data to file (atomic write)
 */
async function writeTasksData(data) {
    data.metadata.lastModified = new Date().toISOString();
    const tempFile = TASKS_FILE + ".tmp";
    await writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
    await writeFile(TASKS_FILE, JSON.stringify(data, null, 2), "utf-8");
}
/**
 * Generate sequential task ID
 * Finds the highest existing task number and increments it
 */
function generateTaskId(existingTasks) {
    // Extract task numbers from existing IDs (format: task-{number})
    const taskNumbers = existingTasks
        .map((task) => {
        const match = task.id.match(/^task-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
    })
        .filter((num) => !isNaN(num));
    // Find the highest number, default to 0 if no valid tasks
    const maxNumber = taskNumbers.length > 0 ? Math.max(...taskNumbers) : 0;
    // Return next sequential ID
    return `task-${maxNumber + 1}`;
}
/**
 * Create and configure the MCP server
 */
const server = new Server({
    name: "tasky-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_tasks",
                description: "Get all tasks from the board. Returns the complete task list with all fields.",
                inputSchema: {
                    type: "object",
                    properties: {
                        boardId: {
                            type: "string",
                            description: "Board ID to filter by (optional, defaults to 'default')",
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
                description: "Add a new task to the board. Task IDs are automatically generated sequentially (task-1, task-2, etc.). Supports custom fields - any additional properties beyond core fields will be preserved.",
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
                            description: "Status/column ID (e.g., 'todo', 'in-progress', 'done'). Defaults to 'todo'",
                        },
                        description: {
                            type: "string",
                            description: "Task description (optional)",
                        },
                        priority: {
                            type: "string",
                            description: "Priority level: low, medium, high, critical (optional)",
                        },
                        tags: {
                            type: "array",
                            items: { type: "string" },
                            description: "Array of tags (optional)",
                        },
                        customFields: {
                            type: "object",
                            description: "Any additional custom fields as key-value pairs (optional)",
                        },
                    },
                    required: ["title"],
                },
            },
            {
                name: "update_task",
                description: "Update an existing task. Can update any field including custom fields.",
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
                            description: "Target status/column (e.g., 'todo', 'in-progress', 'done') (required)",
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
                            description: "Unique column ID (e.g., 'review', 'testing') (required)",
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
                description: "Delete a column from a board. Note: This will not delete tasks in that column, but orphaned tasks won't be visible.",
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
                description: "Create a new board with default columns (todo, in-progress, done). You can customize columns afterward.",
                inputSchema: {
                    type: "object",
                    properties: {
                        boardId: {
                            type: "string",
                            description: "Unique board ID (e.g., 'project-alpha', 'personal') (required)",
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
                description: "Delete a board and all its tasks. This action cannot be undone.",
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
    };
});
/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        return {
            content: [{ type: "text", text: "No arguments provided" }],
            isError: true,
        };
    }
    try {
        switch (name) {
            case "get_tasks": {
                const data = await readTasksData();
                let tasks = data.tasks;
                // Filter by board if specified
                if (args.boardId) {
                    tasks = tasks.filter((t) => t.boardId === args.boardId);
                }
                else {
                    tasks = tasks.filter((t) => t.boardId === "default");
                }
                // Filter by status if specified
                if (args.status) {
                    tasks = tasks.filter((t) => t.status === args.status);
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(tasks, null, 2),
                        },
                    ],
                };
            }
            case "add_task": {
                const data = await readTasksData();
                const newTask = {
                    id: generateTaskId(data.tasks),
                    boardId: args.boardId || "default",
                    title: args.title,
                    status: args.status || "todo",
                    description: args.description || "",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                if (args.priority)
                    newTask.priority = args.priority;
                if (args.tags)
                    newTask.tags = args.tags;
                if (args.customFields && typeof args.customFields === 'object') {
                    Object.assign(newTask, args.customFields);
                }
                data.tasks.push(newTask);
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Task created successfully!\n\n${JSON.stringify(newTask, null, 2)}`,
                        },
                    ],
                };
            }
            case "update_task": {
                const data = await readTasksData();
                const taskIndex = data.tasks.findIndex((t) => t.id === args.taskId);
                if (taskIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Task with ID "${args.taskId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const updates = {
                    updatedAt: new Date().toISOString(),
                };
                if (args.title !== undefined)
                    updates.title = args.title;
                if (args.status !== undefined)
                    updates.status = args.status;
                if (args.description !== undefined)
                    updates.description = args.description;
                if (args.priority !== undefined)
                    updates.priority = args.priority;
                if (args.tags !== undefined)
                    updates.tags = args.tags;
                if (args.customFields) {
                    Object.assign(updates, args.customFields);
                }
                data.tasks[taskIndex] = {
                    ...data.tasks[taskIndex],
                    ...updates,
                };
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Task updated successfully!\n\n${JSON.stringify(data.tasks[taskIndex], null, 2)}`,
                        },
                    ],
                };
            }
            case "delete_task": {
                const data = await readTasksData();
                const taskIndex = data.tasks.findIndex((t) => t.id === args.taskId);
                if (taskIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Task with ID "${args.taskId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const deletedTask = data.tasks[taskIndex];
                data.tasks.splice(taskIndex, 1);
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Task deleted successfully!\n\nDeleted task: ${deletedTask.title}`,
                        },
                    ],
                };
            }
            case "move_task": {
                const data = await readTasksData();
                const taskIndex = data.tasks.findIndex((t) => t.id === args.taskId);
                if (taskIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Task with ID "${args.taskId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                data.tasks[taskIndex].status = args.status;
                data.tasks[taskIndex].updatedAt = new Date().toISOString();
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Task moved successfully!\n\n${data.tasks[taskIndex].title} → ${args.status}`,
                        },
                    ],
                };
            }
            case "get_boards": {
                const data = await readTasksData();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data.boards, null, 2),
                        },
                    ],
                };
            }
            case "search_tasks": {
                const data = await readTasksData();
                const query = String(args.query || "").toLowerCase();
                let tasks = data.tasks;
                if (args.boardId) {
                    tasks = tasks.filter((t) => t.boardId === args.boardId);
                }
                const results = tasks.filter((t) => {
                    const titleMatch = t.title.toLowerCase().includes(query);
                    const descMatch = t.description?.toLowerCase().includes(query);
                    return titleMatch || descMatch;
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Found ${results.length} task(s):\n\n${JSON.stringify(results, null, 2)}`,
                        },
                    ],
                };
            }
            case "add_column": {
                const data = await readTasksData();
                const boardId = args.boardId || "default";
                const boardIndex = data.boards.findIndex((b) => b.id === boardId);
                if (boardIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${boardId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                // Check if column ID already exists
                const existingColumn = data.boards[boardIndex].columns.find((c) => c.id === args.columnId);
                if (existingColumn) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Column with ID "${args.columnId}" already exists.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const newColumn = {
                    id: args.columnId,
                    name: args.name,
                    order: args.order !== undefined ? args.order : data.boards[boardIndex].columns.length,
                };
                data.boards[boardIndex].columns.push(newColumn);
                // Sort columns by order
                data.boards[boardIndex].columns.sort((a, b) => a.order - b.order);
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Column added successfully!\n\n${JSON.stringify(newColumn, null, 2)}`,
                        },
                    ],
                };
            }
            case "update_column": {
                const data = await readTasksData();
                const boardId = args.boardId || "default";
                const boardIndex = data.boards.findIndex((b) => b.id === boardId);
                if (boardIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${boardId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const columnIndex = data.boards[boardIndex].columns.findIndex((c) => c.id === args.columnId);
                if (columnIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Column with ID "${args.columnId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                if (args.name !== undefined) {
                    data.boards[boardIndex].columns[columnIndex].name = args.name;
                }
                if (args.order !== undefined) {
                    data.boards[boardIndex].columns[columnIndex].order = args.order;
                    // Sort columns by order
                    data.boards[boardIndex].columns.sort((a, b) => a.order - b.order);
                }
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Column updated successfully!\n\n${JSON.stringify(data.boards[boardIndex].columns[columnIndex], null, 2)}`,
                        },
                    ],
                };
            }
            case "delete_column": {
                const data = await readTasksData();
                const boardId = args.boardId || "default";
                const boardIndex = data.boards.findIndex((b) => b.id === boardId);
                if (boardIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${boardId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const columnIndex = data.boards[boardIndex].columns.findIndex((c) => c.id === args.columnId);
                if (columnIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Column with ID "${args.columnId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                const deletedColumn = data.boards[boardIndex].columns[columnIndex];
                data.boards[boardIndex].columns.splice(columnIndex, 1);
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Column deleted successfully!\n\nDeleted: ${deletedColumn.name} (${deletedColumn.id})`,
                        },
                    ],
                };
            }
            case "update_board": {
                const data = await readTasksData();
                const boardId = args.boardId || "default";
                const boardIndex = data.boards.findIndex((b) => b.id === boardId);
                if (boardIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${boardId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
                data.boards[boardIndex].name = args.name;
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Board updated successfully!\n\n${JSON.stringify(data.boards[boardIndex], null, 2)}`,
                        },
                    ],
                };
            }
            case "add_board": {
                const data = await readTasksData();
                // Check if board ID already exists
                const existingBoard = data.boards.find((b) => b.id === args.boardId);
                if (existingBoard) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${args.boardId}" already exists.`,
                            },
                        ],
                        isError: true,
                    };
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
                };
                data.boards.push(newBoard);
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Board created successfully!\n\n${JSON.stringify(newBoard, null, 2)}`,
                        },
                    ],
                };
            }
            case "delete_board": {
                const data = await readTasksData();
                const boardIndex = data.boards.findIndex((b) => b.id === args.boardId);
                if (boardIndex === -1) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: Board with ID "${args.boardId}" not found.`,
                            },
                        ],
                        isError: true,
                    };
                }
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
                    };
                }
                const deletedBoard = data.boards[boardIndex];
                // Delete the board
                data.boards.splice(boardIndex, 1);
                // Delete all tasks associated with this board
                const tasksBeforeCount = data.tasks.length;
                data.tasks = data.tasks.filter((t) => t.boardId !== args.boardId);
                const tasksDeletedCount = tasksBeforeCount - data.tasks.length;
                await writeTasksData(data);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Board deleted successfully!\n\nDeleted: ${deletedBoard.name} (${deletedBoard.id})\nTasks deleted: ${tasksDeletedCount}`,
                        },
                    ],
                };
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
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Tasky MCP server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
