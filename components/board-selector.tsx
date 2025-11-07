"use client"

import { useEffect, useState } from "react"
import { LayoutDashboard } from "lucide-react"

import { Board as BoardType } from "@/lib/types"

interface BoardSelectorProps {
  currentBoardId: string
}

export function BoardSelector({ currentBoardId }: BoardSelectorProps) {
  const [boards, setBoards] = useState<BoardType[]>([])

  const fetchBoards = () => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((response) => {
        if (response.success && response.data?.boards) {
          setBoards(response.data.boards)
        }
      })
      .catch((error) => console.error("Failed to fetch boards:", error))
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  useEffect(() => {
    const eventSource = new EventSource("/api/watch")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "file-changed") {
        fetchBoards()
      }
    }

    eventSource.onerror = () => {
      console.error("SSE connection error")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  if (boards.length === 0) {
    return null
  }

  return (
    <div className="sticky top-20 rounded-lg bg-muted p-4 dark:bg-muted/30">
      <div className="mb-3 flex items-center gap-2">
        <LayoutDashboard className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Boards</h3>
      </div>
      <div className="flex flex-col gap-1">
        {boards.map((board) => (
          <a
            key={board.id}
            href={`/?board=${board.id}`}
            className={
              currentBoardId === board.id
                ? "rounded-md bg-accent px-3 py-2 text-sm font-medium"
                : "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            }
          >
            {board.name}
          </a>
        ))}
      </div>
    </div>
  )
}
