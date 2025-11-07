import { NextRequest, NextResponse } from "next/server"

import { createTask, getTasks, readTasksData } from "@/lib/tasks"
import type { ApiResponse, CreateTaskRequest } from "@/lib/types"

/**
 * GET /api/tasks
 * Returns all tasks
 */
export async function GET() {
  try {
    const data = await readTasksData()
    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        tasks: data.tasks,
        boards: data.boards,
        metadata: data.metadata,
      },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch tasks",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks
 * Creates a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json()

    // Validate required fields
    if (!body.boardId || !body.title || !body.status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required fields: boardId, title, status",
        },
        { status: 400 }
      )
    }

    const newTask = await createTask(body)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newTask,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 }
    )
  }
}
