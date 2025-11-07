/**
 * Board Legend Component
 * Displays a color-coded legend for all boards in the calendar view
 */

import { Board } from "@/lib/types"
import { getBoardLegend } from "@/lib/calendar-utils"
import { Badge } from "@/components/ui/badge"

interface BoardLegendProps {
  boards: Board[]
}

export function BoardLegend({ boards }: BoardLegendProps) {
  const legend = getBoardLegend(boards)

  if (legend.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Boards:</span>
      {legend.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-label={`${item.name} color: ${item.colorName}`}
          />
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  )
}
