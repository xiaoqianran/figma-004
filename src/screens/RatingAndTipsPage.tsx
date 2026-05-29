import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Button } from '../components/ui/Button'


interface RatingAndTipsPageProps {
  onBack?: () => void
  onSubmit?: (rating: number, tip: number) => void
  onDone?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del']
]

export function RatingAndTipsPage({ onBack, onSubmit, onDone, variant = 'dark' }: RatingAndTipsPageProps) {
  const isDark = variant === 'dark'
  const { state, submitRating } = useBooking()
  const { activeRide, lastRating } = state

  const bg = isDark ? '#121826' : '#f8fafc'
  const panelBg = isDark ? '#10141e' : '#ffffff'
  const keyBg = isDark ? '#1e293b' : '#f1f5f9'
  const textColor = isDark ? '#f8fafc' : '#1c1f2a'
  const muted = isDark ? '#c5c7d0' : '#6b7280'
  const accent = '#ff712f'

  // Derive ride info from global state (full flow) or sensible fallbacks (gallery/isolated)
  const driverName = activeRide?.driver.name || 'Alex Rivera'
  const rideName = activeRide?.ride.name || 'Comfort Ride'
  const ridePrice = activeRide?.ride.priceDisplay || '$12.40'
  const pickupAddr = activeRide?.pickup.address || 'Current Location'
  const destAddr = activeRide?.destination?.address || 'Destination'

  // Smart default tip (~18% of ride or sensible value)
  const baseTip = activeRide ? Math.max(2, Math.round((activeRide.ride.price * 0.18) * 100) / 100) : 5
  const [tipAmount, setTipAmount] = useState(baseTip.toFixed(2))
  const [rating, setRating] = useState(lastRating?.rating || 5)
  const [submitted, setSubmitted] = useState(false)

  const handleKey = (key: string) => {
    if (submitted) return
    if (key === 'del') {
      setTipAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
      return
    }
    if (key === '.') {
      if (!tipAmount.includes('.')) {
        setTipAmount(prev => prev + '.')
      }
      return
    }
    // numeric
    setTipAmount(prev => {
      if (prev === '0') return key
      const next = prev + key
      if (next.length > 6) return prev
      return next
    })
  }

  const formattedTip = tipAmount.startsWith('$') ? tipAmount : `$${tipAmount}`

  const handleSubmit = () => {
    const tipNum = parseFloat(tipAmount) || 0
    // Update global state (works for both gallery + full-flow)
    submitRating(rating, tipNum)
    // Notify parent flow (RideshareApp wires navigation + final completeRide)
    onSubmit?.(rating, tipNum)
    setSubmitted(true)
  }

  const handleDone = () => {
    if (onDone) onDone()
    else if (onBack) onBack()
  }

  // Success view after rating/tip submitted
  if (submitted) {
    return (
      <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
        <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
          <div>9:41</div>
          <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[72px] mb-4">🎉</div>
          <div className="text-3xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>
            Thank you!
          </div>
          <div className="text-[15px] mb-1" style={{ color: muted }}>
            Your feedback helps drivers improve.
          </div>
          <div className="mt-4 mb-8 text-center">
            <div className="inline-block bg-white/10 rounded-2xl px-5 py-3 text-sm">
              Rated <span className="font-semibold tabular-nums" style={{ color: accent }}>{rating}★</span> and tipped <span className="font-semibold tabular-nums">{formattedTip}</span>
              <div className="text-[12px] mt-1 opacity-70">{driverName} • {rideName}</div>
            </div>
          </div>

          {lastRating && (
            <div className="text-xs opacity-60 mb-6">Saved to your trip history</div>
          )}

          <button 
            onClick={handleDone}
            className="btn-primary w-full max-w-[260px] h-[54px] text-[17px] font-semibold"
          >
            Back to Home
          </button>
          <button 
            onClick={onBack}
            className="mt-3 text-sm font-medium underline opacity-70 active:opacity-100"
            style={{ color: isDark ? '#c5c7d0' : '#4c5df9' }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
      {/* Design system StatusBar */}
      <StatusBar variant={isDark ? 'dark' : 'light'} />

      {/* Header */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl border flex items-center justify-center active:opacity-70"
          style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}
        >
          <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#1c1f2a'} />
        </button>
        <div>
          <div className="text-[18px] font-semibold" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Rate &amp; Tip</div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 pt-2">
        <div className="text-center mb-4">
          <p className="text-[15px] leading-snug" style={{ color: muted }}>
            Rate your ride with <span className="font-semibold" style={{ color: textColor }}>{driverName}</span> and add a tip.
          </p>
        </div>

        {/* Ride summary (wired to state) */}
        <div className="mx-auto mb-5 w-full max-w-[320px] rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: isDark ? '#334155' : '#e5e7eb', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }}>
          <div className="flex justify-between items-baseline">
            <div className="font-medium">{rideName}</div>
            <div className="font-semibold tabular-nums">{ridePrice}</div>
          </div>
          <div className="text-xs mt-0.5" style={{ color: muted }}>{pickupAddr} → {destAddr}</div>
        </div>

        {/* Rating Stars */}
        <div className="flex justify-center gap-3 mb-6">
          {[1,2,3,4,5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className="text-4xl transition-transform active:scale-90"
              aria-label={`${star} star`}
            >
              <span style={{ color: star <= rating ? accent : (isDark ? '#334155' : '#d1d5db') }}>★</span>
            </button>
          ))}
        </div>

        {/* Tip Input */}
        <div className="mb-4">
          <div className="text-xs tracking-widest mb-1.5 px-1" style={{ color: muted }}>TIP AMOUNT</div>
          <div 
            className="rounded-2xl px-6 py-4 text-center"
            style={{ backgroundColor: keyBg }}
          >
            <div className="font-mono text-[42px] font-semibold tracking-[-1px] tabular-nums" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>
              {formattedTip}
            </div>
            <div className="h-px bg-[#121826] opacity-20 my-2 mx-12" />
          </div>
        </div>
      </div>

      {/* Numeric Keypad - large and prominent */}
      <div className="mt-auto px-2 pb-2" style={{ backgroundColor: panelBg }}>
        <div className="grid grid-cols-3 gap-2 p-2">
          {KEYPAD.flat().map((key, idx) => {
            const isDelete = key === 'del'
            const label = isDelete ? '⌫' : key
            return (
              <button
                key={idx}
                onClick={() => handleKey(key)}
                disabled={submitted}
                className="h-[52px] rounded-xl text-[22px] font-medium active:bg-[#4c5df9] active:text-white flex items-center justify-center transition-colors disabled:opacity-60"
                style={{ 
                  backgroundColor: key === '.' ? (isDark ? '#1e293b' : '#e5e7eb') : keyBg,
                  color: textColor,
                  fontFamily: 'Rubik, system-ui, sans-serif',
                  letterSpacing: key.length === 1 ? '1px' : '0'
                }}
              >
                {label}
                {key === '0' && <span className="absolute text-[10px] mt-8 text-[#9fa1b0]"> </span>}
              </button>
            )
          })}
        </div>

        {/* Bottom action */}
        <div className="px-4 pt-3 pb-7">
          <Button 
            onClick={handleSubmit}
            fullWidth
            className="h-[54px] text-[17px]"
          >
            Confirm {rating}★ &amp; Send {formattedTip}
          </Button>
          <button 
            onClick={() => (onDone || onBack)?.()}
            className="w-full text-center text-[15px] font-semibold py-3 mt-1"
            style={{ color: isDark ? '#f8fafc' : '#4c5df9' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
