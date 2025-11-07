"use client"

import { useEffect, useState } from "react"

import { Board as BoardType, Task, TasksData } from "@/lib/types"

import { Column } from "./column"

interface BoardProps {
  boardId: string
}

export function Board({ boardId }: BoardProps) {
  const [data, setData] = useState<TasksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch tasks")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Setup SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/watch")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "file-changed") {
        // File changed, refetch data
        fetchData()
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  const board = data?.boards.find((b) => b.id === boardId)

  if (!board) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    )
  }

  // Get tasks for this board and sort them by column
  const boardTasks =
    data?.tasks.filter((task) => task.boardId === boardId) || []

  // Sort columns by order
  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order)

  return (
    <div className="flex min-h-[600px] gap-4 overflow-x-auto px-1 pb-4">
      {sortedColumns.map((column) => {
        const columnTasks = boardTasks.filter(
          (task) => task.status === column.id
        )
        return <Column key={column.id} column={column} tasks={columnTasks} />
      })}
    </div>
  )
}
