import { useEffect } from 'react'
import { ArrowLeft, Phone, MessageCircle, X } from 'lucide-react'
import { useBooking, RideStatus } from '../context/BookingContext'

interface RideTrackingScreenProps {
  onBack?: () => void
  onComplete?: () => void
}

const statusLabels: Record<RideStatus, string> = {
  confirmed: 'Driver confirmed',
  driver_enroute: 'Driver en route',
  arriving: 'Arriving in 1 min',
  in_progress: 'On your way',
  completed: 'Ride completed',
}

const statusProgress: Record<RideStatus, number> = {
  confirmed: 12,
  driver_enroute: 38,
  arriving: 72,
  in_progress: 94,
  completed: 100,
}

export function RideTrackingScreen({ onBack, onComplete }: RideTrackingScreenProps) {
  const { state, updateRideStatus, completeRide } = useBooking()
  const { activeRide } = state

  // Auto-advance ride status for demo every ~6s
  useEffect(() => {
    if (!activeRide) return

    const sequence: RideStatus[] = ['confirmed', 'driver_enroute', 'arriving', 'in_progress', 'completed']
    const currentIdx = sequence.indexOf(activeRide.status)
    if (currentIdx === -1 || currentIdx === sequence.length - 1) return

    const timer = setTimeout(() => {
      const next = sequence[currentIdx + 1]
      if (next === 'completed') {
        completeRide()
        onComplete?.()
      } else {
        updateRideStatus(next)
      }
    }, 6200)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide?.status])

  if (!activeRide) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-white">
        <div>No active ride</div>
      </div>
    )
  }

  const { driver, pickup, destination, status, bookingId } = activeRide

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Status bar */}
      <div className="status-bar light px-6 pt-1 text-[#1c1f2a]">
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-5 pt-3 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border flex items-center justify-center active:bg-gray-100">
          <ArrowLeft size={19} />
        </button>
        <div className="text-center">
          <div className="font-semibold text-lg tracking-tight">Track your ride</div>
          <div className="text-xs text-gray-500 -mt-0.5">Booking #{bookingId}</div>
        </div>
        <button onClick={onComplete} className="text-xs px-3 py-1.5 text-red-500 font-medium active:bg-red-50 rounded-xl flex items-center gap-1">
          <X size={15} /> Cancel
        </button>
      </div>

      {/* Map placeholder with driver position */}
      <div className="mx-4 mt-4 relative h-[210px] rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #e0e7f0 0%, #c9d4e3 100%)' }} />
        
        {/* Fake road grid */}
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Driver car marker */}
        <div className="absolute left-[38%] top-[46%] transition-all">
          <div className="relative">
            <div className="w-9 h-9 bg-white shadow-xl rounded-2xl flex items-center justify-center text-xl border border-gray-300">🚕</div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-px bg-emerald-500 text-[9px] font-bold text-white rounded">LIVE</div>
          </div>
        </div>

        {/* Pickup & Drop labels */}
        <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-2xl text-xs font-medium shadow flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4c5df9]" /> {pickup.address}
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-2xl text-xs font-medium shadow">
          {destination.address}
        </div>
      </div>

      {/* Status + Progress */}
      <div className="mx-4 mt-5 bg-white rounded-3xl p-5 border border-gray-100">
        <div className="flex justify-between text-sm mb-1.5">
          <div className="font-semibold text-[#1c1f2a]">{statusLabels[status]}</div>
          <div className="font-mono text-emerald-600 tabular-nums font-medium">{driver.etaMinutes} min</div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700" 
            style={{ width: `${statusProgress[status]}%` }} 
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
          <div>Confirmed</div>
          <div>En route</div>
          <div>Arriving</div>
          <div>Complete</div>
        </div>
      </div>

      {/* Driver card */}
      <div className="mx-4 mt-4 bg-white rounded-3xl p-4 flex items-center gap-4 border border-gray-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-2xl font-semibold">
          {driver.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg leading-none">{driver.name}</div>
          <div className="text-sm text-gray-500">{driver.car} • {driver.plate}</div>
          <div className="flex items-center gap-1 mt-1 text-amber-500 text-sm">
            <span>★</span> <span className="font-medium text-gray-700">{driver.rating.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100">
            <Phone size={19} className="text-[#4c5df9]" />
          </button>
          <button className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100">
            <MessageCircle size={19} className="text-[#4c5df9]" />
          </button>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto px-5 pb-8 pt-4 bg-white border-t">
        <button 
          onClick={() => {
            completeRide()
            onComplete?.()
          }}
          className="w-full h-12 border border-gray-300 text-gray-700 font-medium rounded-2xl active:bg-gray-50"
        >
          I have arrived safely
        </button>
        <div className="text-center text-[11px] text-gray-400 mt-3">Share trip status with friends</div>
      </div>
    </div>
  )
}
