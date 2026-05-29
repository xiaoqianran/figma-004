import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Card - Versatile container component matching Figma card patterns
 * 
 * Variants:
 *  - default: White/light card with subtle shadow
 *  - elevated: Stronger shadow
 *  - flat: No shadow, just background + border in dark mode
 *  - dark: Explicit dark surface
 * 
 * Used for RideCard, Payment forms, Saved places, Instructions, etc.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat' | 'dark'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default:
      'bg-white border border-gray-100 shadow-card rounded-3xl',
    elevated:
      'bg-white border border-gray-100 shadow-lg rounded-3xl',
    flat:
      'bg-white border border-gray-100 rounded-3xl',
    dark:
      'bg-[#1e293b] border border-[#334155] text-white rounded-3xl',
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
