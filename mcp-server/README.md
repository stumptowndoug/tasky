# Tasky MCP Server

Model Context Protocol (MCP) server for Tasky - enables AI assistants to manage your tasks directly.

## What is MCP?

MCP (Model Context Protocol) is an open standard by Anthropic that allows AI assistants to interact with external tools and data sources. This server exposes Tasky's task management capabilities to any MCP-compatible tool.

## Quick Start

**For Claude Code and Cursor users**: The project is already configured! Just build the MCP server and start using it:

```bash
# From project root
make mcp-build
# or
npm run mcp:build
```

Then open the project in Claude Code or Cursor - the MCP server will be automatically available.

**For other tools**: See the [MCP Setup Guide](../docs/MCP_SETUP.md) for configuration instructions.

## Features

The MCP server provides these tools:

- **get_tasks** - Retrieve all tasks (with optional filters)
- **add_task** - Create new tasks with custom fields
- **update_task** - Modify existing tasks
- **delete_task** - Remove tasks
- **move_task** - Change task status/column
- **get_boards** - List all boards and columns
- **search_tasks** - Search tasks by text

## Setup

### Quick Setup (from project root)

```bash
# Option 1: Using Make
make mcp-build

# Option 2: Using npm
npm run mcp:build
```

### Manual Setup (if needed)

```bash
cd mcp-server
npm install
npm run build
```

### Configure Your AI Tool

#### Claude Code & Cursor (Auto-configured ✅)

The project includes config files that work automatically:
- `.mcp.json` (Claude Code)
- `.cursor/mcp.json` (Cursor)

Just open the project and the MCP server will be available!

#### Claude Desktop (Manual Setup)

Add the server to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": [
        "/absolute/path/to/tasky/mcp-server/dist/index.js"
      ],
      "cwd": "/absolute/path/to/tasky/mcp-server"
    }
  }
}
```

**Important:** Replace `/absolute/path/to/tasky` with the actual absolute path to your Tasky project.

Then restart Claude Desktop.

#### Other Tools (Codex CLI, etc.)

See the [MCP Setup Guide](../docs/MCP_SETUP.md) for detailed instructions.

## Usage Examples

Once configured, you can ask any AI tool with MCP support:

### Get All Tasks
```
"Show me all my tasks"
"What tasks are in progress?"
```

### Add Tasks
```
"Add a task to research database options"
"Create a high-priority task for fixing the API bug with tags backend and urgent"
```

### Update Tasks
```
"Update task-123 to mark it as high priority"
"Change the title of the authentication task"
```

### Move Tasks
```
"Move the database research task to in-progress"
"Mark task-456 as done"
```

### Search
```
"Find all tasks about API"
"Search for tasks related to authentication"
```

## Custom Integration

Want to integrate Tasky with your own tools? Use the MCP SDK:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client({
  name: "my-client",
  version: "1.0.0",
});

// Connect to the Tasky MCP server
// ... use the client to call tools
```

See the [MCP SDK documentation](https://github.com/anthropics/modelcontextprotocol-sdk) for details.

## Development

### Watch Mode

```bash
npm run watch
```

This rebuilds the server automatically when you make changes.

### Testing

Test the server directly:

```bash
npm run build
node dist/index.js
```

The server communicates via stdio, so you'll need an MCP client to interact with it.

## Architecture

```
AI Tools (Claude Code, Cursor, Claude Desktop, Codex CLI)
    ↓ (MCP Protocol via stdio)
Tasky MCP Server (Node.js)
    ↓ (File System)
../data/tasks.json
    ↓ (File Watching)
Web UI (updates automatically)
```

The MCP server and web UI work together:
- MCP server modifies `tasks.json` directly
- Web UI watches file for changes via SSE
- Changes appear instantly in the browser
- All AI tools share the same data source

## Troubleshooting

### MCP Server Not Available

**For Claude Code/Cursor (project-level config):**
1. Verify the MCP server is built: `ls -la mcp-server/dist/index.js`
2. Rebuild if needed: `make mcp-build`
3. Restart the IDE completely
4. Check that you're opening the project root (where `.mcp.json` is located)

**For Claude Desktop (manual config):**
1. Check the config file path is correct
2. Ensure absolute paths are used (not relative)
3. Check Claude Desktop logs: `~/Library/Logs/Claude/`
4. Restart Claude Desktop completely

### Permission Errors

Make sure the `data/tasks.json` file is writable:

```bash
chmod 644 ../data/tasks.json
```

### Build Errors

Clean and rebuild:

```bash
rm -rf dist node_modules
npm install
npm run build
```

## API Reference

### get_tasks

Get all tasks, optionally filtered.

**Parameters:**
- `boardId` (optional): Filter by board ID
- `status` (optional): Filter by status/column

**Returns:** Array of tasks

### add_task

Create a new task.

**Parameters:**
- `title` (required): Task title
- `boardId` (optional): Board ID (default: "default")
- `status` (optional): Status/column (default: "todo")
- `description` (optional): Task description
- `priority` (optional): low, medium, high, critical
- `tags` (optional): Array of tags
- `customFields` (optional): Any additional fields as object

**Returns:** Created task object

### update_task

Update an existing task.

**Parameters:**
- `taskId` (required): Task ID to update
- Any fields to update (title, status, description, etc.)

**Returns:** Updated task object

### delete_task

Delete a task.

**Parameters:**
- `taskId` (required): Task ID to delete

**Returns:** Confirmation message

### move_task

Move a task to a different column.

**Parameters:**
- `taskId` (required): Task ID to move
- `status` (required): Target column ID

**Returns:** Confirmation message

### get_boards

Get all boards and their columns.

**Parameters:** None

**Returns:** Array of boards with columns

### search_tasks

Search tasks by text.

**Parameters:**
- `query` (required): Search text
- `boardId` (optional): Limit search to specific board

**Returns:** Array of matching tasks

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Anthropic MCP SDK](https://github.com/anthropics/modelcontextprotocol-sdk)
- [Tasky Main README](../README.md)
- [LLM Guide](../docs/LLM_GUIDE.md)
