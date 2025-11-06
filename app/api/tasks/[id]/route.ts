import { NextRequest, NextResponse } from "next/server"
import { getTaskById, updateTask, deleteTask } from "@/lib/tasks"
import type { UpdateTaskRequest, ApiResponse } from "@/lib/types"

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/tasks/[id]
 * Returns a single task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const task = await getTaskById(params.id)

    if (!task) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: task,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch task",
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tasks/[id]
 * Updates a task
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body: Partial<UpdateTaskRequest> = await request.json()
    const updatedTask = await updateTask(params.id, body)

    if (!updatedTask) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedTask,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update task",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const success = await deleteTask(params.id)

    if (!success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { id: params.id },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to delete task",
      },
      { status: 500 }
    )
  }
}
