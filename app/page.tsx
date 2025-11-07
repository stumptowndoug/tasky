"use client"

import { useSearchParams } from "next/navigation"
import { Board } from "@/components/board"
import { HelpDialog } from "@/components/help-dialog"

export default function IndexPage() {
  const searchParams = useSearchParams()
  const boardId = searchParams.get("board") || "default"

  return (
    <section className="container py-6">
      <div className="mb-6 flex items-end justify-end">
        <HelpDialog />
      </div>

      <Board boardId={boardId} />
    </section>
  )
}
