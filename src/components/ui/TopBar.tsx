import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * TopBar (NavHeader) - Consistent screen header with back button, title, and actions
 * 
 * Supports multiple layouts seen across screens:
 *  - Simple back + title
 *  - Back + title + subtitle
 *  - Back + title + right action slot
 * 
 * Replaces dozens of duplicated header blocks.
 */
export interface TopBarProps {
  title?: string
  subtitle?: string
  onBack?: () => void
  rightAction?: React.ReactNode
  variant?: 'light' | 'dark'
  className?: string
  backIconSize?: number
}

export function TopBar({
  title,
  subtitle,
  onBack,
  rightAction,
  variant = 'light',
  className,
  backIconSize = 20,
}: TopBarProps) {
  const isDark = variant === 'dark'

  return (
    <div className={cn('px-6 pt-3 pb-4 flex items-center gap-3', className)}>
      {onBack && (
        <button
          onClick={onBack}
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-xl border active:bg-gray-100 transition-colors flex-shrink-0',
            isDark
              ? 'border-[#334155] text-white active:bg-white/10'
              : 'border-gray-200 text-[#1c1f2a] active:bg-gray-100'
          )}
        >
          <ArrowLeft size={backIconSize} />
        </button>
      )}

      {(title || subtitle) && (
        <div className="flex-1 min-w-0">
          {title && (
            <div
              className={cn(
                'font-semibold text-lg tracking-[-0.2px]',
                isDark ? 'text-white' : 'text-[#1c1f2a]'
              )}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-xs text-gray-500 -mt-0.5">{subtitle}</div>
          )}
        </div>
      )}

      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </div>
  )
}
