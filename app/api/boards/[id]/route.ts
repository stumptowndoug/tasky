import { NextRequest, NextResponse } from "next/server"
import { getBoardById, updateBoard, deleteBoard } from "@/lib/tasks"
import type { UpdateBoardRequest, ApiResponse } from "@/lib/types"

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/boards/[id]
 * Returns a single board by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const board = await getBoardById(params.id)

    if (!board) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Board not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: board,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch board",
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/boards/[id]
 * Updates a board
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body: Partial<UpdateBoardRequest> = await request.json()
    const updatedBoard = await updateBoard(params.id, body)

    if (!updatedBoard) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Board not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedBoard,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update board",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/boards/[id]
 * Deletes a board and all its tasks
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const success = await deleteBoard(params.id)

    if (!success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Board not found",
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
        error: "Failed to delete board",
      },
      { status: 500 }
    )
  }
}
