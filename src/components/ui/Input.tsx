import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Input - Production-grade text input with full design system support
 * 
 * Features:
 *  - Optional floating or static label
 *  - Left and/or right icons (e.g. MapPin, Eye, Camera)
 *  - Error state + message
 *  - Dark / light aware via className or parent
 *  - Consistent 58px / 54px heights matching Figma replicas
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  inputClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const hasError = !!error

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-[#1c1f2a] dark:text-white/90">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c5df9] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full bg-[#f1f3f5] dark:bg-[#1e293b] border-none rounded-2xl px-5 py-[17px] text-[17px] placeholder:text-[#90959e] focus:outline-none focus:ring-2 focus:ring-[#4c5df9]/30 transition-all',
              leftIcon ? 'pl-12' : '',
              rightIcon ? 'pr-12' : '',
              hasError ? 'ring-2 ring-[#fe5050]/60' : '',
              inputClassName,
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c5df9] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-[#fe5050]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
