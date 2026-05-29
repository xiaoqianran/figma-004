import { useEffect, useState } from 'react'
import { ArrowLeft, Phone, MessageCircle, X, CheckCircle, Navigation, Clock } from 'lucide-react'
import { useBooking, RideStatus } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

interface RideTrackingScreenProps {
  onBack?: () => void
  onComplete?: () => void
  onCancel?: () => void
  onRideCompleted?: () => void
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

const statusSteps: { key: RideStatus; label: string; icon: React.ReactNode; short: string }[] = [
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={14} />, short: 'Confirmed' },
  { key: 'driver_enroute', label: 'En route', icon: <Navigation size={14} />, short: 'En route' },
  { key: 'arriving', label: 'Arriving', icon: <Clock size={14} />, short: 'Arriving' },
  { key: 'in_progress', label: 'In progress', icon: <Navigation size={14} />, short: 'On way' },
  { key: 'completed', label: 'Complete', icon: <CheckCircle size={14} />, short: 'Done' },
]

export function RideTrackingScreen({ onBack, onComplete, onCancel, onRideCompleted }: RideTrackingScreenProps) {
  const { state, updateRideStatus } = useBooking()
  const { activeRide } = state

  const [manualMode, setManualMode] = useState(false)

  // Auto-advance ride status for demo every ~6s (paused in manualMode for delightful control)
  useEffect(() => {
    if (!activeRide || manualMode) return

    const sequence: RideStatus[] = ['confirmed', 'driver_enroute', 'arriving', 'in_progress', 'completed']
    const currentIdx = sequence.indexOf(activeRide.status)
    if (currentIdx === -1 || currentIdx === sequence.length - 1) return

    const timer = setTimeout(() => {
      const next = sequence[currentIdx + 1]
      if (next === 'completed') {
        updateRideStatus(next)
        // Do NOT clear ride yet — navigate to rating flow instead
        if (onRideCompleted) {
          onRideCompleted()
        } else {
          onComplete?.()
        }
      } else {
        updateRideStatus(next)
      }
    }, 6200)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRide?.status, manualMode])

  // Visual + manual simulation controls (core improvement)
  const sequence: RideStatus[] = ['confirmed', 'driver_enroute', 'arriving', 'in_progress', 'completed']
  const currentIdx = activeRide ? sequence.indexOf(activeRide.status) : -1

  const jumpToStatus = (newStatus: RideStatus) => {
    setManualMode(true)
    if (newStatus === 'completed') {
      updateRideStatus(newStatus)
      if (onRideCompleted) {
        onRideCompleted()
      } else {
        onComplete?.()
      }
    } else {
      updateRideStatus(newStatus)
    }
  }

  const advanceOneStep = () => {
    if (!activeRide || currentIdx < 0 || currentIdx >= sequence.length - 1) return
    const next = sequence[currentIdx + 1]
    jumpToStatus(next)
  }

  if (!activeRide) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-[#f8fafc] text-center px-8">
        <StatusBar variant="light" />
        <div className="mt-12 w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <Navigation size={32} className="text-gray-400" />
        </div>
        <div className="font-semibold text-xl">No active ride</div>
        <p className="text-gray-500 mt-2 text-sm max-w-[220px]">Your completed rides and summaries will appear here after booking.</p>
        <Button onClick={onBack} variant="secondary" className="mt-6">Return to Home</Button>
      </div>
    )
  }

  const { driver, pickup, destination, status, bookingId } = activeRide

  // Dynamic car position for more visual simulation (moves along fake route)
  const getCarPosition = (s: RideStatus) => {
    switch (s) {
      case 'confirmed': return { left: '18%', top: '62%' }
      case 'driver_enroute': return { left: '32%', top: '54%' }
      case 'arriving': return { left: '48%', top: '47%' }
      case 'in_progress': return { left: '65%', top: '39%' }
      case 'completed': return { left: '78%', top: '32%' }
      default: return { left: '38%', top: '46%' }
    }
  }
  const carPos = getCarPosition(status)

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Design system StatusBar */}
      <StatusBar variant="light" />

      {/* Header */}
      <div className="px-5 pt-3 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border flex items-center justify-center active:bg-gray-100">
          <ArrowLeft size={19} />
        </button>
        <div className="text-center">
          <div className="font-semibold text-lg tracking-tight">Track your ride</div>
          <div className="text-xs text-gray-500 -mt-0.5">Booking #{bookingId}</div>
        </div>
        <button 
          onClick={() => (onCancel || onComplete)?.()} 
          className="text-xs px-3 py-1.5 text-red-500 font-medium active:bg-red-50 rounded-xl flex items-center gap-1"
        >
          <X size={15} /> Cancel
        </button>
      </div>

      {/* Map placeholder with animated driver position (more visual) */}
      <div className="mx-4 mt-3 relative h-[198px] rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #e0e7f0 0%, #c9d4e3 100%)' }} />
        
        {/* Fake road grid */}
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Driver car marker - now position reacts to status */}
        <div 
          className="absolute transition-all duration-700 ease-out"
          style={{ left: carPos.left, top: carPos.top }}
        >
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

      {/* Visual Stepper + Progress (manual skip enabled) */}
      <div className="mx-4 mt-4">
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#1c1f2a] text-sm">{statusLabels[status]}</div>
            <div className="font-mono text-emerald-600 tabular-nums text-sm font-medium">{driver.etaMinutes} min</div>
          </div>

          {/* Clickable visual status steps */}
          <div className="flex justify-between items-center gap-1 mb-3">
            {statusSteps.map((step, idx) => {
              const isActive = status === step.key
              const isPast = currentIdx >= idx
              return (
                <button
                  key={step.key}
                  onClick={() => jumpToStatus(step.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all active:scale-[0.985] ${isActive ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-gray-50'}`}
                  title={`Jump to ${step.label}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPast || isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step.icon}
                  </div>
                  <div className={`text-[9px] font-medium tracking-tight ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>{step.short}</div>
                </button>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700" 
              style={{ width: `${statusProgress[status]}%` }} 
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 px-0.5">
            <div>Confirmed</div><div>En route</div><div>Arriving</div><div>Complete</div>
          </div>

          {/* Manual simulation controls - delightful skip */}
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={advanceOneStep}
              disabled={currentIdx < 0 || currentIdx === sequence.length - 1}
              className="flex-1 h-9 text-xs"
            >
              Skip to next stage →
            </Button>
            <button 
              onClick={() => setManualMode(!manualMode)} 
              className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 text-gray-500 active:bg-gray-50"
            >
              {manualMode ? 'Resume auto' : 'Pause auto'}
            </button>
          </div>
        </Card>
      </div>

      {/* Driver card (enhanced with Card) */}
      <div className="mx-4 mt-3">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
            {driver.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg leading-none">{driver.name}</div>
            <div className="text-sm text-gray-500">{driver.car} • {driver.plate}</div>
            <div className="flex items-center gap-1 mt-1 text-amber-500 text-sm">
              <span>★</span> <span className="font-medium text-gray-700">{driver.rating.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100">
              <Phone size={19} className="text-[#4c5df9]" />
            </button>
            <button className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100">
              <MessageCircle size={19} className="text-[#4c5df9]" />
            </button>
          </div>
        </Card>
      </div>

      {/* Ride summary inline (high value) */}
      <div className="mx-4 mt-3 text-[11px]">
        <div className="px-1 text-gray-500 mb-1 tracking-wider">RIDE SUMMARY</div>
        <Card padding="sm" className="text-sm flex justify-between items-center bg-white">
          <div>
            <span className="font-medium text-[#1c1f2a]">{activeRide.ride.name}</span> <span className="text-gray-500">• {activeRide.ride.priceDisplay}</span>
          </div>
          <div className="text-emerald-600 font-medium">{activeRide.ride.eta} pickup</div>
        </Card>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto px-5 pb-8 pt-4 bg-white border-t">
        <Button 
          variant="secondary"
          fullWidth
          onClick={() => {
            updateRideStatus('completed')
            if (onRideCompleted) {
              onRideCompleted()
            } else {
              onComplete?.()
            }
          }}
          className="h-12 text-base border-gray-300"
        >
          I have arrived safely
        </Button>
        <div className="text-center text-[11px] text-gray-400 mt-3">Share trip status with friends • End-to-end encrypted</div>
      </div>
    </div>
  )
}
