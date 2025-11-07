/**
 * Board color configuration for calendar and multi-board views
 *
 * This module provides a consistent color scheme for boards across the app.
 * Colors are defined in HSL format to work seamlessly with dark/light themes.
 */

import { Board } from './types'

/**
 * Predefined color palette for boards
 * Using HSL format for better dark mode compatibility
 */
export const BOARD_COLOR_PALETTE = [
  { id: 'blue', name: 'Blue', hsl: '217 91% 60%', hex: '#3b82f6' },
  { id: 'purple', name: 'Purple', hsl: '271 81% 56%', hex: '#a855f7' },
  { id: 'green', name: 'Green', hsl: '142 71% 45%', hex: '#22c55e' },
  { id: 'orange', name: 'Orange', hsl: '25 95% 53%', hex: '#f97316' },
  { id: 'pink', name: 'Pink', hsl: '330 81% 60%', hex: '#ec4899' },
  { id: 'teal', name: 'Teal', hsl: '173 80% 40%', hex: '#14b8a6' },
  { id: 'red', name: 'Red', hsl: '0 84% 60%', hex: '#ef4444' },
  { id: 'yellow', name: 'Yellow', hsl: '48 96% 53%', hex: '#eab308' },
  { id: 'indigo', name: 'Indigo', hsl: '239 84% 67%', hex: '#6366f1' },
  { id: 'cyan', name: 'Cyan', hsl: '189 94% 43%', hex: '#06b6d4' },
] as const

/**
 * Default board color assignments
 */
const DEFAULT_BOARD_COLORS: Record<string, string> = {
  default: 'blue',
  work: 'purple',
}

/**
 * Get the color palette entry for a board
 */
export function getBoardColor(boardId: string): typeof BOARD_COLOR_PALETTE[number] {
  const colorId = DEFAULT_BOARD_COLORS[boardId] || getColorForUnknownBoard(boardId)
  return BOARD_COLOR_PALETTE.find(c => c.id === colorId) || BOARD_COLOR_PALETTE[0]
}

/**
 * Assign a color to a board that doesn't have a predefined color
 * Uses a hash of the board ID to consistently assign the same color
 */
function getColorForUnknownBoard(boardId: string): string {
  const hash = boardId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const index = Math.abs(hash) % BOARD_COLOR_PALETTE.length
  return BOARD_COLOR_PALETTE[index].id
}

/**
 * Get board color assignments for multiple boards
 */
export function getBoardColors(boards: Board[]): Map<string, typeof BOARD_COLOR_PALETTE[number]> {
  const colorMap = new Map<string, typeof BOARD_COLOR_PALETTE[number]>()

  boards.forEach(board => {
    colorMap.set(board.id, getBoardColor(board.id))
  })

  return colorMap
}

/**
 * Get a CSS-compatible HSL color string
 */
export function getBoardColorHsl(boardId: string): string {
  const color = getBoardColor(boardId)
  return `hsl(${color.hsl})`
}

/**
 * Get a hex color string (useful for external libraries)
 */
export function getBoardColorHex(boardId: string): string {
  const color = getBoardColor(boardId)
  return color.hex
}
