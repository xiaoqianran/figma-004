import React from 'react'
import { cn } from '../../lib/utils'

/**
 * StatusBar - iOS-style device status bar (time + connectivity + battery)
 * 
 * Matches exact Figma replica styling across all screens.
 * - Fixed 9:41 time and 100% battery as per original designs
 * - Supports light (dark text) / dark (white text) variants
 * - Signal indicator rendered as dots to match high-fidelity mockups
 */
export interface StatusBarProps {
  variant?: 'light' | 'dark'
  className?: string
  showSignal?: boolean
  time?: string
  battery?: string
}

export function StatusBar({
  variant = 'dark',
  className,
  showSignal = true,
  time = '9:41',
  battery = '100%',
}: StatusBarProps) {
  const isLight = variant === 'light'

  return (
    <div
      className={cn(
        'h-11 w-full flex items-center justify-between px-6 pt-1 text-sm font-semibold select-none',
        isLight ? 'text-[#1c1f2a]' : 'text-white',
        className
      )}
    >
      <div>{time}</div>
      <div className="flex items-center gap-1.5 text-xs">
        {showSignal && <span>●●●●●</span>}
        <span>WiFi</span>
        <span>{battery}</span>
      </div>
    </div>
  )
}
