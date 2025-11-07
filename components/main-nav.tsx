"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface Board {
  id: string
  name: string
}

export function MainNav() {
  const [boards, setBoards] = useState<Board[]>([])
  const searchParams = useSearchParams()
  const currentBoardId = searchParams.get("board") || "default"

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

  // Initial fetch
  useEffect(() => {
    fetchBoards()
  }, [])

  // Setup SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/watch")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "file-changed") {
        // File changed, refetch boards
        fetchBoards()
      }
    }

    eventSource.onerror = () => {
      console.error("SSE connection error in MainNav")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {boards.length > 0 && (
        <nav className="flex gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/?board=${board.id}`}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-foreground",
                currentBoardId === board.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {board.name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
