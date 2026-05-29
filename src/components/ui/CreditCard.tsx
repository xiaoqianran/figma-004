import React from 'react'
import { cn } from '../../lib/utils'

/**
 * CreditCard - Visual representation of a payment card
 * 
 * High-fidelity replica of the gradient cards used in Add Card / Payment flows.
 * Supports dark/light color schemes and fake data overrides.
 */
export interface CreditCardProps {
  variant?: 'dark' | 'light'
  cardNumber?: string
  balance?: string
  expiry?: string
  label?: string
  className?: string
  height?: number
}

export function CreditCard({
  variant = 'dark',
  cardNumber = '4523 •••• •••• 9526',
  balance = '$1500',
  expiry = '05/23',
  label = 'Debit card',
  className,
  height = 178,
}: CreditCardProps) {
  const isDarkVariant = variant === 'dark'
  const cardBg = isDarkVariant ? '#4c2bd4' : '#7c6cff'

  return (
    <div
      className={cn(
        'rounded-3xl p-6 relative overflow-hidden shadow-2xl',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${cardBg} 0%, #6b4ee8 100%)`,
        height,
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute right-12 top-8 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute left-8 bottom-4 w-10 h-10 rounded-full bg-white/10" />

      <div className="relative h-full flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-white/70 text-xs tracking-[1px]">{label}</div>
          </div>
          <div className="flex -space-x-1">
            <div className="w-8 h-8 rounded-full bg-white/30" />
            <div className="w-8 h-8 rounded-full bg-white/60" />
          </div>
        </div>

        <div>
          <div className="text-white text-xl tracking-[3px] font-mono">
            {cardNumber}
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <div className="text-white/90">{balance}</div>
            <div className="text-white/90">{expiry}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
