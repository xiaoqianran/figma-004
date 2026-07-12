import { useEffect, useState } from 'react'
import { ArrowLeft, Phone, MessageCircle, X, CheckCircle, Navigation, Clock, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking, RideStatus } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

interface RideTrackingScreenProps {
  onBack?: () => void
  onComplete?: () => void
  onCancel?: (reason?: string) => void
  onRideCompleted?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  /** Optional recovery when no active ride (gallery empty shell) */
  onBookRide?: () => void
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

export function RideTrackingScreen({ onBack, onComplete, onCancel, onRideCompleted, showToast, onBookRide }: RideTrackingScreenProps) {
  const { state, updateRideStatus, seedDemoActiveRide } = useBooking()
  const { activeRide } = state

  const [manualMode, setManualMode] = useState(false)

  // Cancel ride flow state (high-fidelity confirmation + reason selection)
  const [showCancelSheet, setShowCancelSheet] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  // Share Trip modal state (link & handlers defined after activeRide guard)
  const [showShareModal, setShowShareModal] = useState(false)

  const CANCEL_REASONS = [
    'Driver taking too long',
    'Changed plans',
    'Found another ride',
    'Price too high',
    'Other',
  ] as const

  // Gallery previews: seed a realistic active ride when none exists (no-op during live tracking)
  useEffect(() => {
    if (!activeRide) {
      seedDemoActiveRide()
    }
  }, [activeRide, seedDemoActiveRide])

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

  // --- Cancel flow handlers (thoughtful, safe UX) ---
  const openCancelSheet = () => {
    setShowCancelSheet(true)
    setSelectedReason(null)
    setOtherText('')
    setIsCancelling(false)
  }

  const closeCancelSheet = () => {
    if (isCancelling) return
    setShowCancelSheet(false)
    // reset for next time
    setTimeout(() => {
      setSelectedReason(null)
      setOtherText('')
    }, 200)
  }

  const handleConfirmCancel = async () => {
    if (!selectedReason) return
    const finalReason = selectedReason === 'Other' ? (otherText.trim() || 'Other') : selectedReason

    setIsCancelling(true)

    // Brief realistic processing delay (feels like API call to cancel backend)
    await new Promise((resolve) => setTimeout(resolve, 720))

    // Delegate to parent (RideshareApp wires to clear state + toast feedback)
    onCancel?.(finalReason)

    // Component will typically unmount on navigation; no further state needed
  }

  const isCancelConfirmDisabled = !selectedReason || isCancelling

  if (!activeRide) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-[#f8fafc] text-center px-8">
        <StatusBar variant="light" />
        <div className="mt-12 w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <Navigation size={32} className="text-gray-400" />
        </div>
        <div className="font-semibold text-xl">No active ride</div>
        <p className="text-gray-500 mt-2 text-sm max-w-[220px]">
          Your completed rides and summaries will appear here after booking.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-[240px]">
          <Button onClick={() => seedDemoActiveRide()} fullWidth>
            Load demo tracking
          </Button>
          {(onBookRide || onBack) && (
            <Button onClick={onBookRide || onBack} variant="secondary" fullWidth>
              {onBookRide ? 'Book a ride' : 'Return to Home'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const { driver, pickup, destination, status, bookingId } = activeRide

  // Share Trip logic (scoped after guard so bookingId is available)
  const shareLink = `https://meteor.app/trip/${bookingId || 'demo-trip-42'}`
  const openShareModal = () => setShowShareModal(true)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      showToast?.('Trip link copied to clipboard!', 'success')
    } catch {
      showToast?.(`Link: ${shareLink}`, 'info')
    }
  }

  const handleSendViaMessages = () => {
    showToast?.('Opening Messages composer (demo) — link sent!', 'success')
    setShowShareModal(false)
  }

  const handleShareToWhatsApp = () => {
    showToast?.('Shared via WhatsApp (demo)', 'success')
    setShowShareModal(false)
  }

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
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden relative">
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
        <div className="flex items-center gap-1.5">
          <button 
            onClick={openShareModal} 
            className="text-xs px-2.5 py-1.5 text-[#4c5df9] font-medium active:bg-[#eef3ff] rounded-xl flex items-center gap-1 active:scale-[0.985] transition"
            aria-label="Share trip"
          >
            <Share2 size={15} /> Share
          </button>
          <button 
            onClick={openCancelSheet} 
            className="text-xs px-3 py-1.5 text-red-500 font-medium active:bg-red-50 rounded-xl flex items-center gap-1"
          >
            <X size={15} /> Cancel
          </button>
        </div>
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
            <button 
              onClick={() => showToast?.(`Calling ${driver.name}...`, 'info')}
              className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100 active:scale-[0.96] transition"
              aria-label={`Call ${driver.name}`}
            >
              <Phone size={19} className="text-[#4c5df9]" />
            </button>
            <button 
              onClick={() => showToast?.(`Opening chat with ${driver.name}`, 'info')}
              className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100 active:scale-[0.96] transition"
              aria-label={`Message ${driver.name}`}
            >
              <MessageCircle size={19} className="text-[#4c5df9]" />
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-11 h-11 rounded-2xl border flex items-center justify-center active:bg-gray-100 active:scale-[0.96] transition"
              aria-label="Share trip status"
            >
              <Share2 size={19} className="text-[#4c5df9]" />
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
        <button 
          onClick={openShareModal}
          className="text-center text-[11px] text-[#4c5df9] mt-3 w-full font-medium active:underline active:text-[#3a4bd1] transition"
        >
          Share trip status with friends • End-to-end encrypted
        </button>
      </div>

      {/* Cancel Ride confirmation bottom sheet (high-fidelity, reason-driven flow) */}
      <AnimatePresence>
        {showCancelSheet && (
          <div className="absolute inset-0 z-[95] flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeCancelSheet}
            />

            {/* Sheet panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }}
              className="relative w-full bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-7 border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={17} className="text-red-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg tracking-tight text-[#1c1f2a]">Cancel ride?</div>
                    <div className="text-[12px] text-gray-500 -mt-0.5">Free cancellation • No charge applied</div>
                  </div>
                </div>
                <button
                  onClick={closeCancelSheet}
                  disabled={isCancelling}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 active:text-gray-600 active:bg-gray-100 rounded-full disabled:opacity-50"
                  aria-label="Close cancel sheet"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Safety note */}
              <div className="text-[13px] text-gray-600 mt-2 mb-4 leading-snug">
                We&apos;re sorry to see you go. Selecting a reason helps us improve the experience.
              </div>

              {/* Reason selection (required) */}
              <div className="text-[11px] font-semibold tracking-[0.5px] text-gray-500 mb-2 px-0.5">SELECT A REASON</div>
              <div className="space-y-[6px]">
                {CANCEL_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason
                  return (
                    <button
                      key={reason}
                      onClick={() => {
                        setSelectedReason(reason)
                        if (reason !== 'Other') setOtherText('')
                      }}
                      disabled={isCancelling}
                      className={`w-full text-left px-4 py-[13px] rounded-2xl border flex items-center justify-between transition-all active:scale-[0.995] disabled:opacity-60 ${
                        isSelected
                          ? 'border-[#4c5df9] bg-[#f0f4ff] ring-1 ring-[#4c5df9]/10'
                          : 'border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <span className={`text-[15px] font-medium ${isSelected ? 'text-[#1c1f2a]' : 'text-[#1c1f2a]'}`}>
                        {reason}
                      </span>
                      {isSelected && <CheckCircle size={18} className="text-[#4c5df9] flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {/* Other text input (shown only when Other selected) */}
              {selectedReason === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Please tell us more (optional)"
                    disabled={isCancelling}
                    className="w-full bg-[#f1f3f5] border-none rounded-2xl px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4c5df9]/30 disabled:opacity-60"
                    maxLength={120}
                  />
                  <div className="text-[10px] text-gray-400 mt-1 px-1">Your feedback is private and helps us improve.</div>
                </div>
              )}

              {/* Confirm actions */}
              <div className="mt-5 flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={closeCancelSheet}
                  disabled={isCancelling}
                  className="h-12 text-[15px] border-gray-200"
                >
                  Keep my ride
                </Button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelConfirmDisabled}
                  className={`flex-1 h-12 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.985] flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                    isCancelConfirmDisabled
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-red-500 text-white active:bg-red-600 shadow-sm'
                  }`}
                >
                  {isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm cancel'
                  )}
                </button>
              </div>

              <div className="text-center text-[10px] text-gray-400 mt-4">You can always rebook instantly from Home.</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Trip bottom sheet (polished, fully functional micro-interaction) */}
      <AnimatePresence>
        {showShareModal && (
          <div className="absolute inset-0 z-[96] flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowShareModal(false)}
            />

            {/* Sheet panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }}
              className="relative w-full bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-7 border-t border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#eef3ff] flex items-center justify-center">
                    <Share2 size={17} className="text-[#4c5df9]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg tracking-tight text-[#1c1f2a]">Share your trip</div>
                    <div className="text-[12px] text-gray-500 -mt-0.5">Friends can track you live</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 active:text-gray-600 active:bg-gray-100 rounded-full"
                  aria-label="Close share sheet"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Fake share link display */}
              <div className="mt-4 mb-3">
                <div className="text-[11px] uppercase tracking-[0.5px] text-gray-500 px-0.5 mb-1.5">TRIP LINK</div>
                <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3 text-xs font-mono text-[#1c1f2a] break-all select-all">
                  {shareLink}
                </div>
              </div>

              {/* Primary share actions */}
              <div className="space-y-2.5">
                <button
                  onClick={handleCopyLink}
                  className="w-full h-12 rounded-2xl bg-[#4c5df9] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:bg-[#3a4bd1] active:scale-[0.985] transition"
                >
                  Copy link
                </button>

                <button
                  onClick={handleSendViaMessages}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-white text-[#1c1f2a] font-semibold text-[15px] flex items-center justify-center gap-2 active:bg-gray-50 active:scale-[0.985] transition"
                >
                  Send via Messages
                </button>

                <button
                  onClick={handleShareToWhatsApp}
                  className="w-full h-12 rounded-2xl border border-gray-200 bg-white text-[#1c1f2a] font-semibold text-[15px] flex items-center justify-center gap-2 active:bg-gray-50 active:scale-[0.985] transition"
                >
                  Share to WhatsApp (demo)
                </button>
              </div>

              {/* QR placeholder for polish */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-white border border-gray-200 rounded-2xl p-2 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-[repeating-linear-gradient(0deg,#1c1f2a_0,#1c1f2a_1.5px,transparent_1.5px,transparent_5px),repeating-linear-gradient(90deg,#1c1f2a_0,#1c1f2a_1.5px,transparent_1.5px,transparent_5px)] rounded-lg opacity-80" />
                </div>
                <div className="text-[10px] text-gray-400 mt-1.5 tracking-wide">Scan QR to join live trip</div>
              </div>

              <div className="text-center text-[10px] text-gray-400 mt-4">Link expires in 24h • Private by default</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
