# Tasky - Learn AI Coding Tools & MCPs

**A friendly project to learn how AI coding assistants work**

Tasky is a simple task manager (like a to-do list) that you manage entirely through AI assistants like Claude. It's designed to help you learn how modern AI coding tools work, especially something called MCPs (Model Context Protocol).

## Why Tasky?

Instead of clicking buttons to add tasks, you'll tell an AI assistant like Claude Code to do it for you. This teaches you:

- How to work with AI coding assistants
- What MCPs are and why they're useful
- How AI tools can interact with your projects
- How modern developers use AI to build software

**Perfect for**: Anyone curious about AI coding tools, even if you're new to programming!

---

## What You'll Need

Before starting, make sure you have these tools installed:

### 1. Node.js (JavaScript runtime)

**What it is**: The engine that runs this project
**Check if you have it**: Open Terminal (Mac) or Command Prompt (Windows) and type:
```bash
node --version
```

**If you see a version number** (like `v20.x.x`), you're good!
**If you get an error**: Download and install from [nodejs.org](https://nodejs.org/) - choose the "LTS" version (recommended for most users)

### 2. An AI Coding Assistant

You need an ai coding assistant. Here are some examples:

- **Claude Code** (Recommended for beginners) - [Get it here](https://claude.ai/claude-code)
- **Cursor** - [cursor.com](https://cursor.com)
- **Codex CLI** - [openai.com/codex/](https://github.com/openai/codex)
- **OpenCode** - [opencode.ai/](https://github.com/sst/opencode)

### 3. A Code Editor (Or Cursor)

- **VS Code** - [code.visualstudio.com](https://code.visualstudio.com/) (Free and beginner-friendly)
- Or use the editor built into Claude Code/Cursor

---

## Getting Started

### Step 1: Download the Project

**Option A: Using Git (recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/tasky.git
cd tasky
```

**Option B: Download as ZIP**
1. Click the green "Code" button on GitHub
2. Select "Download ZIP"
3. Unzip the file
4. Open Terminal and navigate to the folder:
   ```bash
   cd path/to/tasky
   ```

### Step 2: Install Everything

In your Terminal (inside the tasky folder), run:

```bash
npm run setup
```

**What this does**: Downloads and installs all the code libraries this project needs. This might take 1-2 minutes. You only need to do this once!

**You'll know it worked when**: You see messages like "Setup complete!" with no errors.

### Step 3: Start the App

```bash
npm run dev
```

**What this does**: Starts the task manager so you can see it in your browser.

**You'll know it worked when**: You see a message like:
```
✓ Ready on http://localhost:3737
```

**Now open your browser** and go to: **http://localhost:3737**

You should see a beautiful kanban board with some example tasks!

---

## How to Use Tasky

### The Big Idea

**You don't click buttons** to add or move tasks. Instead, you ai assistants what you want, and it does it for you!

### Basic Examples

Open Claude Code in the tasky folder and try these:

1. **Add a task**
   ```
   "Add a task called 'Learn about MCPs' to my todo list"
   ```

2. **Move a task**
   ```
   "Move the 'Learn about MCPs' task to In Progress"
   ```

3. **See all your tasks**
   ```
   "Show me all my tasks"
   ```

4. **Create a high-priority task**
   ```
   "Add a high-priority task to research AI coding tools"
   ```

**Watch the board update in your browser** as Claude makes changes! It happens instantly.

---

## Understanding MCPs (The Cool Part!)

### What is MCP?

**MCP** stands for **Model Context Protocol**. Think of it as a way for AI assistants to interact directly with apps and tools.

**Without MCP**: You'd have to manually edit files, and the AI couldn't really "do" things for you.

**With MCP**: The AI can actually perform actions in your app - like adding tasks, searching, organizing, etc.

### How Tasky Uses MCP

When you tell Claude to "add a task," here's what happens:

1. Claude understands what you want
2. Claude uses Tasky's MCP tools (like `add_task`)
3. The task gets added to your data
4. The board updates automatically

**You're learning**: How AI tools can directly interact with applications using MCPs!

### What MCP Tools Does Tasky Have?

Tasky gives Claude these "powers":

- `add_task` - Create new tasks
- `update_task` - Edit existing tasks
- `move_task` - Move tasks between columns
- `delete_task` - Remove tasks
- `get_tasks` - View all tasks
- `search_tasks` - Find tasks by keyword
- `add_board` - Create new boards
- `add_column` - Add new columns to boards

**Try asking Claude**: "What MCP tools do you have available for Tasky?"

---

## Next Steps

### Experiment!

Now that it's working, try:

1. **Add your own tasks**: Tell Claude about things you actually need to do
2. **Create a new board**: "Create a board called 'Learning Projects'"
3. **Search your tasks**: "Search for all tasks about learning"
4. **Get creative**: See what Claude can do when you ask it to organize your tasks

### Look at the Code

Want to see how it works? Open these files in your code editor:

- `data/tasks.json` - Your tasks are stored here as simple text
- `components/board.tsx` - The visual board you see in the browser
- `mcp-server/src/index.ts` - The MCP tools Claude uses

**Don't worry if you don't understand everything** - just exploring helps you learn!

### Learn More About MCPs

- Ask Claude: "Explain how MCPs work in simple terms"
- Read: [docs/MCP_SETUP.md](docs/MCP_SETUP.md) for more advanced setup
- Experiment: Try building your own MCP tools (Claude can help!)

---

## Troubleshooting

### "npm: command not found"
- You need to install Node.js (see "What You'll Need" above)

### Port 3737 is already in use
- Something else is using that port. Try:
  ```bash
  npm run dev -- -p 3738
  ```
  Then open http://localhost:3738

### Changes aren't showing up
- Make sure `npm run dev` is still running in your Terminal
- Refresh your browser (Cmd+R on Mac, Ctrl+R on Windows)

### Claude says it can't find MCP tools
- Make sure you're in the tasky folder when you open Claude Code
- Try closing and reopening Claude Code

---

## Tips for Learning

1. **Ask Claude to explain things**: "Explain what just happened when you added that task"
2. **Look at the changes**: Open `data/tasks.json` to see how your tasks are stored
3. **Experiment**: Try breaking things! It's just practice data, you can always reset
4. **Take it slow**: You don't need to understand everything at once

---

## What's Next?

Once you're comfortable with Tasky, you can:

- **Modify the code**: Change colors, add new features, customize it!
- **Build your own MCP server**: Create tools for other apps you use
- **Share with friends**: Show others how AI coding tools work
- **Use these skills**: Apply what you learned to other coding projects

---

## Get Help

- **Ask Claude**: Seriously! Claude Code can help you understand any part of this project
- **Check the docs**: [docs/LLM_GUIDE.md](docs/LLM_GUIDE.md) has more details
- **GitHub Issues**: Report bugs or ask questions on the project's GitHub page

---

## Remember

**You're learning by doing!** Every time you ask Claude to do something with Tasky, you're learning how modern AI-powered development works. Don't be afraid to experiment and make mistakes - that's how you learn.

**Have fun building!** 🚀
