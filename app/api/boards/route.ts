import { NextRequest, NextResponse } from "next/server"
import { getBoards, createBoard } from "@/lib/tasks"
import type { CreateBoardRequest, ApiResponse } from "@/lib/types"

/**
 * GET /api/boards
 * Returns all boards
 */
export async function GET() {
  try {
    const boards = await getBoards()
    return NextResponse.json<ApiResponse>({
      success: true,
      data: boards,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to fetch boards",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/boards
 * Creates a new board
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateBoardRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.columns || body.columns.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Missing required fields: name, columns",
        },
        { status: 400 }
      )
    }

    const newBoard = await createBoard(body)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: newBoard,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to create board",
      },
      { status: 500 }
    )
  }
}
