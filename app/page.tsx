"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { Board } from "@/components/board"
import { HelpDialog } from "@/components/help-dialog"

function IndexPageContent() {
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

export default function IndexPage() {
  return (
    <Suspense fallback={<div className="container py-6">Loading...</div>}>
      <IndexPageContent />
    </Suspense>
  )
}
