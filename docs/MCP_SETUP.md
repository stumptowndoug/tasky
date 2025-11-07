# MCP Setup Guide for Tasky

Configure the Tasky MCP server for Cursor, Claude Code, and Codex CLI

## Prerequisites

Make sure you've built the MCP server first:

```bash
# From project root
make mcp-build
# or
npm run mcp:build
```

## Quick Start (Project-Level)

**Recommended for Claude Code users**: The project includes a `.mcp.json` file that automatically configures the Tasky MCP server when you open this project in Claude Code. No additional setup needed!

For other tools or user-level configuration, see below.

---

## 1. Cursor Setup

### Project-Level Config (Recommended)

Create `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### Global Config

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": ["/absolute/path/to/tasky/mcp-server/dist/index.js"],
      "cwd": "/absolute/path/to/tasky"
    }
  }
}
```

**Important**: Replace `/absolute/path/to/tasky` with the actual path to your Tasky project.

---

## 2. Claude Code Setup

### Project-Level Config (Automatic)

The project includes `.mcp.json` in the root, which Claude Code automatically detects:

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

No action needed - just open the project in Claude Code!

### User-Level Config

Edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": ["/absolute/path/to/tasky/mcp-server/dist/index.js"],
      "cwd": "/absolute/path/to/tasky"
    }
  }
}
```

### Enterprise Config

For enterprise deployments:

**macOS**: `/Library/Application Support/ClaudeCode/managed-mcp.json`
**Linux**: `/etc/claude-code/managed-mcp.json`
**Windows**: `C:\ProgramData\ClaudeCode\managed-mcp.json`

Use the same JSON format as user-level config.

---

## 3. Codex CLI Setup

Edit `~/.codex/config.toml`:

```toml
[mcp.servers.tasky]
command = "node"
args = ["/absolute/path/to/tasky/mcp-server/dist/index.js"]
cwd = "/absolute/path/to/tasky"
```

**Note**: Codex CLI MCP support is experimental. If servers don't appear, check:
1. Codex version is recent
2. Config file syntax is correct
3. Server path is absolute

---

## Available MCP Tools

Once configured, you can use these tools through any AI assistant:

### get_tasks
Get all tasks, optionally filtered by board or status.

**Example**: "Show me all tasks in the todo column"

### add_task
Create a new task with optional fields (priority, tags, custom fields).

**Example**: "Add a high-priority task to research databases with tags backend and data"

### update_task
Modify existing task properties.

**Example**: "Update task-123 to change priority to high"

### delete_task
Remove a task by ID.

**Example**: "Delete task-456"

### move_task
Change a task's status/column.

**Example**: "Move task-123 to done"

### get_boards
List all boards and their columns.

**Example**: "Show me all available boards"

### search_tasks
Search tasks by text in title or description.

**Example**: "Find all tasks about authentication"

---

## Testing Your Setup

After configuring your AI tool, restart it and try:

```
"Show me all my Tasky tasks"
```

You should see the AI tool call the `get_tasks` MCP tool and return your tasks.

Then try:

```
"Add a task called 'Test MCP integration' to my todo list"
```

The task should appear in your kanban board at http://localhost:3737

---

## Troubleshooting

### MCP Server Not Found

1. **Verify the build**:
   ```bash
   ls -la mcp-server/dist/index.js
   ```

2. **Rebuild if needed**:
   ```bash
   make mcp-build
   ```

3. **Check absolute paths**: For global/user configs, use absolute paths, not relative ones.

### Tools Not Appearing

1. **Restart your AI tool** completely after config changes
2. **Check config file location** matches your tool's expectations
3. **Verify JSON/TOML syntax** - one syntax error breaks the whole config

### Permission Errors

```bash
chmod 644 data/tasks.json
chmod +x mcp-server/dist/index.js
```

### Cursor-Specific Issues

- Project-level config (`.cursor/mcp.json`) overrides global config
- Cursor may need a full restart, not just reload window

### Claude Code-Specific Issues

- Check `~/.claude.json` exists and has correct syntax
- Project-level `.mcp.json` takes precedence in that project
- Verify node is in PATH: `which node`

### Codex CLI-Specific Issues

- TOML format is sensitive to syntax
- Codex MCP support is newer - ensure you're on latest version
- Check Codex logs for connection errors

---

## Configuration Priority

When multiple config files exist, this is the precedence:

### Cursor
1. Project-level (`.cursor/mcp.json`)
2. Global (`~/.cursor/mcp.json`)

### Claude Code
1. Enterprise managed config
2. Project-level (`.mcp.json`)
3. User-level (`~/.claude.json`)

### Codex CLI
1. User-level (`~/.codex/config.toml`)

---

## Summary Table

| Client | Config File Path | Format | Auto-configured |
|--------|-----------------|--------|-----------------|
| Cursor | `.cursor/mcp.json` or `~/.cursor/mcp.json` | JSON | No |
| Claude Code | `.mcp.json` (project) or `~/.claude.json` | JSON | ✅ Yes (project-level) |
| Codex CLI | `~/.codex/config.toml` | TOML | No |

---

## Environment Variables

The Tasky MCP server doesn't require environment variables, but you can add them if needed:

```json
{
  "mcpServers": {
    "tasky": {
      "command": "node",
      "args": ["mcp-server/dist/index.js"],
      "env": {
        "DEBUG": "true",
        "CUSTOM_VAR": "${MY_ENV_VAR}"
      }
    }
  }
}
```

Claude Code supports `${VAR}` interpolation for environment variables.

---

## Next Steps

1. Configure your preferred AI tool using the examples above
2. Restart the tool
3. Try the test commands to verify setup
4. See [LLM_GUIDE.md](LLM_GUIDE.md) for usage examples
5. Check [mcp-server/README.md](../mcp-server/README.md) for API reference

---

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Anthropic MCP SDK](https://github.com/anthropics/modelcontextprotocol-sdk)
- [Claude Code MCP Guide](https://code.claude.com/docs)
