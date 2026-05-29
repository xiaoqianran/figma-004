import React from 'react'
import { cn } from '../../lib/utils'

/**
 * BottomNav - Bottom navigation bar for main app flows
 * 
 * Placeholder production component ready for tab navigation (Home, Search, Rides, Profile etc.)
 * Styled to match the visual language of the rest of the replica.
 */
export interface BottomNavItem {
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export interface BottomNavProps {
  items: BottomNavItem[]
  className?: string
}

export function BottomNav({ items, className }: BottomNavProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-around border-t bg-white dark:bg-[#121826] dark:border-[#1e293b] py-2 px-2',
        className
      )}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={cn(
            'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all active:opacity-70',
            item.active
              ? 'text-[#4c5df9]'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          <div className="text-xl">{item.icon}</div>
          <div className="text-[10px] font-medium tracking-wide">{item.label}</div>
        </button>
      ))}
    </div>
  )
}
