import { NextRequest } from "next/server"
import { watch } from "fs"
import path from "path"

// Get tasks file path from environment variable or use default
const TASKS_FILE_PATH = process.env.TASKS_FILE_PATH
  ? path.join(process.cwd(), process.env.TASKS_FILE_PATH)
  : path.join(process.cwd(), "data", "tasks.json")

/**
 * GET /api/watch
 * Server-Sent Events endpoint for real-time file watching
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      )

      // Watch the tasks.json file for changes
      const watcher = watch(TASKS_FILE_PATH, (eventType) => {
        if (eventType === "change") {
          // Notify client that file changed
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "file-changed" })}\n\n`
              )
            )
          } catch (error) {
            // Stream might be closed
            watcher.close()
          }
        }
      })

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "heartbeat" })}\n\n`
            )
          )
        } catch (error) {
          clearInterval(heartbeat)
          watcher.close()
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
        watcher.close()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
