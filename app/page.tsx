"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { Board } from "@/components/board"
import { BoardSelector } from "@/components/board-selector"

function BoardView() {
  const searchParams = useSearchParams()
  const boardId = searchParams.get("board") || "default"

  return (
    <>
      <div className="mb-6 flex justify-center">
        <BoardSelector currentBoardId={boardId} />
      </div>
      <Board boardId={boardId} />
    </>
  )
}

export default function IndexPage() {
  return (
    <section className="container py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <BoardView />
      </Suspense>
    </section>
  )
}
