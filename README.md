# Tasky

A minimal, LLM-friendly task management app with a beautiful kanban board.

## Overview

Tasky is designed for seamless collaboration between humans and AI agents. Tasks are stored in a simple JSON file that can be edited directly by LLM agents like Claude Code, making task management effortless and automated.

## Features

- **Read-Only Kanban Board** - Beautiful, minimal display-only interface
- **LLM-First Design** - Designed exclusively for AI agent management
- **MCP Server** - Model Context Protocol server for Claude Desktop & other AI tools
- **Real-time File Watching** - Instant updates via Server-Sent Events (no polling!)
- **Custom Fields** - Add unlimited custom fields to any task
- **Dark Mode** - Beautiful light and dark themes
- **Local-First** - All data stored locally in `data/tasks.json`
- **Zero Manual Editing** - All changes through AI assistants or direct file editing
- **Fully Open Source** - Built with Next.js, TypeScript, and shadcn/ui

## Quick Start

### Option 1: Using Make (Recommended)

```bash
make install    # One-time setup (installs everything)
make dev        # Start the development server
# Open http://localhost:3000
```

### Option 2: Using npm

```bash
npm run setup   # One-time setup (installs everything)
npm run dev     # Start the development server
# Open http://localhost:3000
```

### MCP Server (Auto-configured!)

The project includes MCP server support for AI tools:

```bash
make mcp-build  # or: npm run mcp:build
```

**Auto-configured for:**
- ✅ **Claude Code** - Works out of the box (`.mcp.json`)
- ✅ **Cursor** - Works out of the box (`.cursor/mcp.json`)
- **Codex CLI** - See [MCP_SETUP.md](docs/MCP_SETUP.md)
- **Claude Desktop** - See [mcp-server/README.md](mcp-server/README.md)

**Note:** The installs are one-time only (or when dependencies change). Daily use is just `make dev` or `npm run dev`!

## For Users

### Managing Tasks

This is an **LLM-first task manager**. The board is **read-only** by design - all task management happens through AI assistants.

- **View Tasks**: Beautiful kanban board with real-time updates
- **Add/Edit/Delete Tasks**: Use AI assistants (Claude Code, Cursor, Copilot)
- **Real-time Updates**: Changes appear instantly via file watching
- **Dark Mode**: Toggle theme using the button in the top-right corner

### Using AI Assistants

Simply tell your AI assistant what you want:

- "Add a task to research databases"
- "Move the authentication task to done"
- "Update all high priority tasks from yesterday"
- "Organize completed tasks by adding tags"

**Recommended AI Tools:**
- **Claude Code** (this tool!) - Best integration
- **Claude Desktop** - Use via MCP Server (see below)
- **Cursor** - Great for inline editing
- **GitHub Copilot** - Works with the JSON file

### Using MCP Server (All AI Tools)

Tasky includes an MCP server for deep integration with AI assistants:

**Auto-configured tools** (no setup needed):
- **Claude Code** - Just open the project
- **Cursor** - Just open the project

**Manual setup required**:
- **Claude Desktop** - See [mcp-server/README.md](mcp-server/README.md)
- **Codex CLI** - See [docs/MCP_SETUP.md](docs/MCP_SETUP.md)

Once configured, you can ask any AI tool:
- "Show me all my tasks"
- "Add a high-priority task for API testing"
- "Move the authentication task to done"
- "Search for tasks about databases"

**Full setup guide: [docs/MCP_SETUP.md](docs/MCP_SETUP.md)**

### Customizing Colors

All colors are defined using CSS variables in `styles/globals.css`. You can easily customize:

- Background colors
- Text colors
- Border colors
- Accent colors
- Button colors

Simply edit the `:root` and `.dark` sections in `globals.css` to match your preferred color scheme.

### Data Storage

All your tasks are stored in `data/tasks.json`. You can:

- **Backup**: Copy the `data/` folder
- **Share**: Commit `data/tasks.json` to git
- **Edit Directly**: Modify the JSON file manually
- **Version Control**: Track changes with git

## For AI Agents (Claude Code, GPT, etc.)

**👉 See [docs/LLM_GUIDE.md](docs/LLM_GUIDE.md) for detailed instructions**

### Quick Reference

The tasks are stored in `data/tasks.json` with this structure:

```json
{
  "boards": [
    {
      "id": "default",
      "name": "My Tasks",
      "columns": [
        {"id": "todo", "name": "To Do", "order": 0},
        {"id": "in-progress", "name": "In Progress", "order": 1},
        {"id": "done", "name": "Done", "order": 2}
      ]
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "boardId": "default",
      "title": "Task title",
      "status": "todo",
      "description": "Optional description",
      "createdAt": "2025-01-06T10:00:00Z",
      "updatedAt": "2025-01-06T10:00:00Z",
      "priority": "high",
      "tags": ["example", "custom-field"]
    }
  ],
  "metadata": {
    "version": "1.0",
    "lastModified": "2025-01-06T10:00:00Z"
  }
}
```

### Common Operations

**Add a task:**
```json
{
  "id": "task-new-123",
  "boardId": "default",
  "title": "New task",
  "status": "todo",
  "createdAt": "2025-01-06T10:00:00Z",
  "updatedAt": "2025-01-06T10:00:00Z"
}
```

**Move a task:**
```json
// Change the "status" field to the target column id
"status": "done"
```

**Add custom fields:**
```json
{
  "id": "task-123",
  "title": "Research task",
  "status": "in-progress",
  // Add any custom fields you want!
  "priority": "high",
  "estimatedHours": 4,
  "assignee": "Doug",
  "tags": ["research", "ai"]
}
```

## Project Structure

```
tasky/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for CRUD operations
│   ├── layout.tsx         # Root layout with dark mode
│   └── page.tsx           # Main kanban board page
├── components/            # React components
│   ├── board.tsx         # Main board component
│   ├── column.tsx        # Column component
│   ├── task-card.tsx     # Task card component
│   └── ui/               # shadcn/ui components
├── data/                 # Data storage
│   └── tasks.json        # All tasks and boards
├── docs/                 # Documentation
│   └── LLM_GUIDE.md     # Guide for AI agents
├── lib/                  # Utilities and types
│   ├── tasks.ts         # File system utilities
│   └── types.ts         # TypeScript types
└── styles/
    └── globals.css       # Global styles with CSS variables
```

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes

## API Routes

- `GET /api/tasks` - Get all tasks and boards
- `GET /api/watch` - Server-Sent Events endpoint for real-time file watching
- `POST /api/tasks` - Create a new task (for programmatic access)
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

**Note:** The UI doesn't use the write endpoints - all task management happens via direct file editing by AI assistants.

## Development

### Quick Commands (Make)

```bash
make install       # One-time setup (installs everything)
make dev          # Run dev server
make build        # Build for production
make mcp-build    # Build MCP server
make mcp-watch    # Watch/rebuild MCP server
make clean        # Clean everything
make help         # Show all commands
```

### npm Scripts

```bash
npm run setup      # One-time setup
npm run dev        # Run dev server
npm run build      # Build for production
npm start          # Run production server
npm run typecheck  # Type check
npm run lint       # Lint code
npm run format:write  # Format code
npm run mcp:build  # Build MCP server
npm run mcp:watch  # Watch MCP server
```

### Workspaces

Tasky uses npm workspaces to manage both the web app and MCP server in one repo. A single `npm install` at the root installs everything!

## Sharing Tasks

### Option 1: Git-based (Recommended)

Simply commit the `data/` folder to share tasks with your team:

```bash
git add data/tasks.json
git commit -m "Update tasks"
git push
```

To keep tasks private, add to `.gitignore`:

```
data/tasks.json
```

### Option 2: Export/Import

Copy the `data/tasks.json` file and share it manually.

## Contributing

Contributions are welcome! This is an open-source project designed to be simple and extensible.

## License

MIT License - feel free to use this project for any purpose.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
