"use client"

import { Board } from "@/components/board"
import { HelpDialog } from "@/components/help-dialog"

export default function IndexPage() {
  return (
    <section className="container py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered task management with real-time updates
          </p>
        </div>
        <HelpDialog />
      </div>

      <Board boardId="default" />
    </section>
  )
}
