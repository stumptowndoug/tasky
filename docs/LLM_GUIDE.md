# Tasky - LLM Agent Guide

This guide is specifically written for AI agents (Claude Code, GPT, Copilot, etc.) to help you effectively manage tasks in Tasky.

## Quick Start

Tasky stores all tasks in a single JSON file: `data/tasks.json`

You can directly read and write to this file. The web UI automatically detects changes and refreshes every 3 seconds.

## File Structure

### Location
```
data/tasks.json
```

### Schema

```typescript
{
  boards: Board[]        // Array of kanban boards
  tasks: Task[]          // Array of all tasks
  metadata: Metadata     // File metadata
}
```

## Data Types

### Board
```typescript
{
  id: string              // Unique board identifier
  name: string            // Board display name
  columns: Column[]       // Array of columns in this board
}
```

### Column
```typescript
{
  id: string              // Unique column identifier (used as task status)
  name: string            // Column display name
  order: number           // Display order (0, 1, 2, ...)
}
```

### Task
```typescript
{
  // Required fields
  id: string              // Unique task identifier (e.g., "task-1234567890-abc")
  boardId: string         // Which board this task belongs to
  title: string           // Task title/name
  status: string          // Column ID (e.g., "todo", "in-progress", "done")
  createdAt: string       // ISO 8601 timestamp
  updatedAt: string       // ISO 8601 timestamp

  // Optional core fields
  description?: string    // Longer task description

  // Custom fields (add any you want!)
  [key: string]: any      // Examples: priority, tags, assignee, dueDate, etc.
}
```

### Metadata
```typescript
{
  version: string         // Schema version
  lastModified: string    // ISO 8601 timestamp
}
```

## Common Operations

### 1. Read All Tasks

```typescript
import fs from 'fs/promises'
import path from 'path'

const tasksPath = path.join(process.cwd(), 'data', 'tasks.json')
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// Access tasks
const allTasks = data.tasks
const todoTasks = data.tasks.filter(t => t.status === 'todo')
```

### 2. Add a New Task

```typescript
// Read the file
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// Create new task
const newTask = {
  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  boardId: "default",
  title: "Your task title",
  status: "todo",  // or "in-progress", "done"
  description: "Optional description",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Add custom fields as needed
  priority: "high",
  tags: ["example", "important"],
  estimatedHours: 2,
  assignee: "Doug"
}

// Add to array
data.tasks.push(newTask)

// Update metadata
data.metadata.lastModified = new Date().toISOString()

// Write back
await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
```

### 3. Update a Task

```typescript
// Read the file
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// Find task by ID
const taskIndex = data.tasks.findIndex(t => t.id === 'task-123')

if (taskIndex !== -1) {
  // Update fields
  data.tasks[taskIndex] = {
    ...data.tasks[taskIndex],
    title: "Updated title",
    status: "in-progress",
    updatedAt: new Date().toISOString(),

    // Add or update custom fields
    priority: "high"
  }

  // Update metadata
  data.metadata.lastModified = new Date().toISOString()

  // Write back
  await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
}
```

### 4. Move a Task to Different Column

```typescript
// Read the file
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// Find and update
const task = data.tasks.find(t => t.id === 'task-123')
if (task) {
  task.status = "done"  // Move to "Done" column
  task.updatedAt = new Date().toISOString()

  data.metadata.lastModified = new Date().toISOString()
  await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
}
```

### 5. Delete a Task

```typescript
// Read the file
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// Filter out the task
data.tasks = data.tasks.filter(t => t.id !== 'task-123')

// Update metadata
data.metadata.lastModified = new Date().toISOString()

// Write back
await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
```

### 6. Find Tasks by Criteria

```typescript
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

// By status
const inProgressTasks = data.tasks.filter(t => t.status === 'in-progress')

// By custom field
const highPriorityTasks = data.tasks.filter(t => t.priority === 'high')

// By tag
const taggedTasks = data.tasks.filter(t =>
  t.tags && t.tags.includes('important')
)

// By text search
const searchTasks = data.tasks.filter(t =>
  t.title.toLowerCase().includes('search term') ||
  (t.description && t.description.toLowerCase().includes('search term'))
)
```

### 7. Add Custom Fields to Existing Task

```typescript
const data = JSON.parse(await fs.readFile(tasksPath, 'utf8'))

const task = data.tasks.find(t => t.id === 'task-123')
if (task) {
  // Simply add new fields - they'll be preserved
  task.priority = "high"
  task.tags = ["urgent", "bug-fix"]
  task.dueDate = "2025-01-15"
  task.estimatedHours = 4
  task.assignee = "Doug"
  task.customFieldExample = "any value you want"
  task.updatedAt = new Date().toISOString()

  data.metadata.lastModified = new Date().toISOString()
  await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
}
```

## Best Practices

### 1. Always Use Atomic Writes

```typescript
// ✅ Good: Write to temp file, then rename (atomic)
const tempPath = tasksPath + '.tmp'
await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8')
await fs.rename(tempPath, tasksPath)

// ❌ Bad: Direct write (can corrupt if interrupted)
await fs.writeFile(tasksPath, JSON.stringify(data, null, 2), 'utf8')
```

### 2. Generate Unique IDs

```typescript
// ✅ Good: Timestamp + random
const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// ❌ Bad: Sequential numbers (can conflict)
const id = `task-${data.tasks.length + 1}`
```

### 3. Always Update Timestamps

```typescript
// ✅ Good: Update both task and metadata timestamps
task.updatedAt = new Date().toISOString()
data.metadata.lastModified = new Date().toISOString()

// ❌ Bad: Forget to update timestamps
// (UI won't know file changed)
```

### 4. Validate Before Writing

```typescript
// ✅ Good: Validate required fields
if (!task.id || !task.boardId || !task.title || !task.status) {
  throw new Error('Missing required task fields')
}

// Check board exists
const boardExists = data.boards.some(b => b.id === task.boardId)
if (!boardExists) {
  throw new Error(`Board ${task.boardId} does not exist`)
}

// Check status/column exists
const board = data.boards.find(b => b.id === task.boardId)
const columnExists = board.columns.some(c => c.id === task.status)
if (!columnExists) {
  throw new Error(`Column ${task.status} does not exist`)
}
```

### 5. Use Pretty JSON

```typescript
// ✅ Good: Human-readable JSON
JSON.stringify(data, null, 2)

// ❌ Bad: Minified JSON
JSON.stringify(data)
```

## Example: Complete Task Management Script

```typescript
import fs from 'fs/promises'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json')

async function readTasks() {
  const content = await fs.readFile(TASKS_FILE, 'utf8')
  return JSON.parse(content)
}

async function writeTasks(data: any) {
  data.metadata.lastModified = new Date().toISOString()

  const tempFile = TASKS_FILE + '.tmp'
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tempFile, TASKS_FILE)
}

async function createTask(title: string, status: string = 'todo', customFields: any = {}) {
  const data = await readTasks()

  const newTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    boardId: 'default',
    title,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...customFields
  }

  data.tasks.push(newTask)
  await writeTasks(data)

  return newTask
}

async function updateTask(taskId: string, updates: any) {
  const data = await readTasks()

  const taskIndex = data.tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found`)
  }

  data.tasks[taskIndex] = {
    ...data.tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  await writeTasks(data)
  return data.tasks[taskIndex]
}

async function deleteTask(taskId: string) {
  const data = await readTasks()
  data.tasks = data.tasks.filter(t => t.id !== taskId)
  await writeTasks(data)
}

async function moveTask(taskId: string, newStatus: string) {
  return updateTask(taskId, { status: newStatus })
}

async function findTasks(filter: (task: any) => boolean) {
  const data = await readTasks()
  return data.tasks.filter(filter)
}

// Usage examples:
const newTask = await createTask('Build a feature', 'todo', {
  priority: 'high',
  tags: ['feature', 'urgent'],
  estimatedHours: 4
})

await updateTask(newTask.id, {
  title: 'Build an awesome feature',
  priority: 'critical'
})

await moveTask(newTask.id, 'in-progress')

const highPriorityTasks = await findTasks(t => t.priority === 'high')

await deleteTask(newTask.id)
```

## Column IDs

The default board has these columns:

- `todo` - To Do
- `in-progress` - In Progress
- `done` - Done

Use these as the `status` field when creating or updating tasks.

## Custom Fields

You can add ANY custom fields to tasks. Common examples:

- `priority`: "low" | "medium" | "high" | "critical"
- `tags`: string[] - Array of tags
- `dueDate`: string - ISO date
- `assignee`: string - Person assigned
- `estimatedHours`: number - Time estimate
- `actualHours`: number - Time spent
- `blockedBy`: string[] - Array of task IDs
- `relatedTasks`: string[] - Array of task IDs
- `attachments`: string[] - File paths or URLs
- `comments`: Array<{text: string, author: string, timestamp: string}>

The UI will display these automatically in the task cards.

## API Alternative

Instead of direct file editing, you can also use the REST API:

```bash
# Get all tasks
GET http://localhost:3000/api/tasks

# Create task
POST http://localhost:3000/api/tasks
{
  "boardId": "default",
  "title": "New task",
  "status": "todo",
  "description": "Optional"
}

# Update task
PUT http://localhost:3000/api/tasks/[taskId]
{
  "title": "Updated title",
  "status": "done"
}

# Delete task
DELETE http://localhost:3000/api/tasks/[taskId]
```

However, **direct file editing is recommended** for LLM agents as it's simpler and more reliable.

## Error Handling

Always wrap file operations in try-catch:

```typescript
try {
  const data = await readTasks()
  // ... modify tasks ...
  await writeTasks(data)
} catch (error) {
  console.error('Failed to update tasks:', error)
  // Handle error appropriately
}
```

## Performance Tips

- The tasks.json file is read on every UI refresh (every 3 seconds)
- Keep the file size reasonable (<1MB, <10,000 tasks)
- Use pretty JSON for readability (worth the extra bytes)
- Consider archiving completed tasks if the file gets too large

## Need Help?

- Check `lib/types.ts` for TypeScript type definitions
- See `lib/tasks.ts` for reference implementations
- Look at `data/example-tasks.json` for more examples
- Read the main `README.md` for user documentation

## Summary

1. Tasks are in `data/tasks.json`
2. Read → Modify → Write (with atomic writes)
3. Update timestamps (`updatedAt`, `lastModified`)
4. Use unique IDs for new tasks
5. Add custom fields freely
6. Validate before writing
7. UI auto-refreshes every 3 seconds

That's it! You're ready to manage tasks programmatically. 🎉
