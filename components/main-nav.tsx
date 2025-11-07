"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard } from "lucide-react"

import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <LayoutDashboard className="size-4" />
        Boards
      </Link>
      <Link
        href="/calendar"
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/calendar" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Calendar className="size-4" />
        Calendar
      </Link>
    </nav>
  )
}
