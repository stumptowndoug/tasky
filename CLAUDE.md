# AI Agent Instructions for Tasky

## ⚠️ Important: This Project Has Two Modes

Tasky is BOTH a Next.js application AND an MCP server for task management. Understanding which mode to use is critical.

## Mode 1: Task Management (Use MCP Tools)

**When the user is managing their tasks**, use the MCP tools:

- `add_task` - Create new tasks
- `update_task` - Modify task details
- `move_task` - Change task status/column
- `delete_task` - Remove tasks
- `get_tasks` - View all tasks
- `search_tasks` - Find tasks by keyword
- `add_board` - Create new boards
- `update_board` - Rename boards
- `delete_board` - Remove boards
- `add_column` - Add columns to boards
- `update_column` - Modify column names/order
- `delete_column` - Remove columns

**User intent examples:**
- "Add a task to buy groceries"
- "Move the authentication task to done"
- "Create a new board for my side project"
- "What tasks do I have in progress?"

**DO NOT** directly edit `data/tasks.json` for task management - always use MCP tools.

## Mode 2: Development (Edit Code Directly)

**When the user is developing/improving the app itself**, edit code files directly:

- Modify React components (`components/`, `app/`)
- Update styles (`styles/globals.css`)
- Change types (`lib/types.ts`)
- Improve the MCP server (`mcp-server/src/`)
- Update configuration files
- Modify documentation

**User intent examples:**
- "Add a new field to the task card UI"
- "Change the color scheme to blue"
- "Fix the bug in the file watcher"
- "Update the README"

**DO** use standard file editing tools (Read, Edit, Write) for code changes.

## How to Know Which Mode

**Use MCP Tools if:**
- User mentions tasks, boards, or columns as data (not code)
- Request is about organizing/managing work items
- You see tool descriptions that match the request

**Edit Code if:**
- User mentions React, Next.js, components, styling, or bugs
- Request is about how the app works or looks
- You're improving functionality or fixing issues

## Additional Resources

- **Detailed MCP Guide**: `docs/LLM_GUIDE.md`
- **MCP Setup**: `docs/MCP_SETUP.md`
- **Project README**: `README.md`

## Summary

Think of it this way:
- **Managing tasks** = Use MCP tools (you're the user)
- **Building features** = Edit code (you're the developer)

When in doubt, ask the user to clarify their intent.
