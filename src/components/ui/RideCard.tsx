import React from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Card } from './Card'

/**
 * RideCard - Domain component for displaying available rides / cars
 * 
 * Replaces the repeated car list item markup in CarResultScreen.
 * High visual fidelity to Figma references (gradient image placeholder, meta rows).
 */
export interface RideCardProps {
  name: string
  type: string
  price: string
  time: string
  rating: string
  seats: number
  distance?: string
  onClick?: () => void
  className?: string
}

export function RideCard({
  name,
  type,
  price,
  time,
  rating,
  seats,
  distance = '1.2km away',
  onClick,
  className,
}: RideCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex gap-4 cursor-pointer active:bg-gray-50 transition-colors',
        className
      )}
      padding="md"
    >
      {/* Car image placeholder */}
      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl">
        🚗
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div>
            <div className="font-semibold text-[17px]">{name}</div>
            <div className="text-sm text-gray-500">{type} • {seats} seats</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-xl">{price}</div>
            <div className="text-xs text-emerald-500">+{time}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="px-2.5 py-0.5 bg-[#f1f5f9] rounded text-xs font-medium">
            {rating} ★
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={13} /> {distance}
          </div>
        </div>
      </div>
    </Card>
  )
}
