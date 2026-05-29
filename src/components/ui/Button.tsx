import React from 'react'
import { cn } from '../../lib/utils'
// No framer-motion inside Button (prevents type conflicts when screens wrap it with motion.div for animations)

/**
 * Button - Production-grade reusable button component
 * 
 * Variants:
 *  - primary: Solid brand fill (default)
 *  - secondary: Outlined / light surface
 *  - ghost: Text only, minimal
 * 
 * Sizes: sm | md | lg (default lg matches 56px high-fidelity buttons)
 * 
 * Supports full dark/light via className or explicit variant.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

const baseStyles =
  'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:pointer-events-none'

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#4c5df9] text-white hover:bg-[#3b4dd9] shadow-lg',
  secondary:
    'bg-white text-[#1c1f2a] border border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:bg-[#1e293b] dark:text-white dark:border-[#334155] dark:hover:bg-[#161a21]',
  ghost:
    'bg-transparent text-[#4c5df9] hover:bg-[#4c5df9]/8 active:bg-[#4c5df9]/12',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-12 px-5 text-[15px] rounded-2xl',
  lg: 'h-[56px] px-6 text-[17px] rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
