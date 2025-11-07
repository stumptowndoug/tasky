"use client"

import { useSearchParams } from "next/navigation"

import { Board } from "@/components/board"
import { BoardSelector } from "@/components/board-selector"

export default function IndexPage() {
  const searchParams = useSearchParams()
  const boardId = searchParams.get("board") || "default"

  return (
    <section className="container py-6">
      <div className="flex gap-6">
        {/* Main board area */}
        <div className="flex-1">
          <Board boardId={boardId} />
        </div>

        {/* Board selector sidebar */}
        <div className="w-48 shrink-0">
          <BoardSelector currentBoardId={boardId} />
        </div>
      </div>
    </section>
  )
}
