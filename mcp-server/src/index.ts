#!/usr/bin/env node

/**
 * Tasky MCP Server
 *
 * Model Context Protocol server for managing tasks in Tasky.
 * Works with Claude Desktop, Cursor, and other MCP-compatible tools.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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
async function writeTasksData(data: any) {
  data.metadata.lastModified = new Date().toISOString();
  const tempFile = TASKS_FILE + ".tmp";
  await writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
  await writeFile(TASKS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Generate unique task ID
 */
function generateTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
);

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
        description: "Add a new task to the board. Supports custom fields - any additional properties beyond core fields will be preserved.",
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
          tasks = tasks.filter((t: any) => t.boardId === args.boardId);
        } else {
          tasks = tasks.filter((t: any) => t.boardId === "default");
        }

        // Filter by status if specified
        if (args.status) {
          tasks = tasks.filter((t: any) => t.status === args.status);
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

        const newTask: any = {
          id: generateTaskId(),
          boardId: args.boardId || "default",
          title: args.title,
          status: args.status || "todo",
          description: args.description || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (args.priority) newTask.priority = args.priority;
        if (args.tags) newTask.tags = args.tags;
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
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId);

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

        const updates: any = {
          updatedAt: new Date().toISOString(),
        };

        if (args.title !== undefined) updates.title = args.title;
        if (args.status !== undefined) updates.status = args.status;
        if (args.description !== undefined) updates.description = args.description;
        if (args.priority !== undefined) updates.priority = args.priority;
        if (args.tags !== undefined) updates.tags = args.tags;
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
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId);

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
        const taskIndex = data.tasks.findIndex((t: any) => t.id === args.taskId);

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
          tasks = tasks.filter((t: any) => t.boardId === args.boardId);
        }

        const results = tasks.filter((t: any) => {
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
  } catch (error) {
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
