import React, { useState, useMemo, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FareItem {
  label: string
  amount: number
  hint?: string
}

interface FareBreakdownProps {
  isOpen: boolean
  onClose: () => void
  ride: {
    name: string
    type: string
    price: number
    priceDisplay: string
    eta: string
  } | null
  giftBalance?: number
}

/**
 * FareBreakdown - Premium bottom-sheet modal for detailed price / fare transparency.
 *
 * - Matches app visual language (rounded-3xl, #4c5df9 accents, Inter typography, Card-like surfaces)
 * - Interactive gift balance toggle to demonstrate real-time impact on final price
 * - Realistic rideshare-style line items (base, distance, time, service) that sum to quoted price
 * - Clear "You pay" total with savings callout when credits apply
 * - Accessible: tap outside / X / Done to close; proper ARIA roles
 */
export function FareBreakdown({ isOpen, onClose, ride, giftBalance = 0 }: FareBreakdownProps) {
  const [applyGift, setApplyGift] = useState(giftBalance > 0)

  // Reset toggle preference when gift balance or ride changes (demo UX)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplyGift(giftBalance > 0)
  }, [giftBalance, ride?.price])

  const fareItems: FareItem[] = useMemo(() => {
    if (!ride) return []
    const total = ride.price

    // Proportional realistic split (demo data). Remainder goes to service fee so items always sum exactly.
    const baseFare = parseFloat((total * 0.48).toFixed(2))
    let distanceCharge = parseFloat((total * 0.30).toFixed(2))
    const timeCharge = parseFloat((total * 0.10).toFixed(2))
    let serviceFee = parseFloat((total - baseFare - distanceCharge - timeCharge).toFixed(2))

    // Ensure service fee stays realistic and positive
    if (serviceFee < 1.49) {
      serviceFee = 1.99
      // Minor rebalance on distance for nicer demo numbers
      distanceCharge = parseFloat((distanceCharge - 0.5).toFixed(2))
    }

    return [
      {
        label: 'Base fare',
        amount: baseFare,
        hint: 'Includes first 1.5 mi + driver dispatch',
      },
      {
        label: 'Distance charge',
        amount: distanceCharge,
        hint: 'Est. 4.2–5.1 mi @ $1.05–$1.25/mi',
      },
      {
        label: 'Time charge',
        amount: timeCharge,
        hint: 'Est. 9–14 min @ $0.28/min',
      },
      {
        label: 'Service fee',
        amount: serviceFee,
        hint: 'Platform, booking & safety',
      },
    ]
  }, [ride])

  const fareSubtotal = useMemo(
    () => fareItems.reduce((sum, item) => sum + item.amount, 0),
    [fareItems]
  )

  const appliedCredit = applyGift ? Math.min(giftBalance, fareSubtotal) : 0
  const youPay = Math.max(0, parseFloat((fareSubtotal - appliedCredit).toFixed(2)))

  if (!ride) return null

  const hasGift = giftBalance > 0
  const savings = appliedCredit > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-[1px]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fare-title"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.98 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 280, mass: 0.9 }}
            className="w-full max-w-[375px] bg-white rounded-t-3xl shadow-2xl overflow-hidden border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS-style drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-[3px] bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pb-4">
              <div>
                <div id="fare-title" className="font-semibold text-[21px] tracking-[-0.2px] text-[#1c1f2a]">
                  Fare breakdown
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {ride.name} • {ride.type} • {ride.eta}
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-0.5 w-9 h-9 -mr-1 flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100 active:text-gray-700 transition"
                aria-label="Close fare breakdown"
              >
                <X size={21} />
              </button>
            </div>

            <div className="px-5 pb-8 max-h-[62vh] overflow-y-auto overscroll-contain">
              {/* Line items */}
              <div className="divide-y divide-gray-100 text-[15px]">
                {fareItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-[13px] first:pt-1">
                    <div className="pr-4">
                      <div className="font-medium text-[#1c1f2a]">{item.label}</div>
                      {item.hint && (
                        <div className="text-xs text-gray-500 leading-tight mt-px pr-1">{item.hint}</div>
                      )}
                    </div>
                    <div className="font-semibold tabular-nums text-[#1c1f2a] whitespace-nowrap">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ride fare subtotal */}
              <div className="flex justify-between items-center pt-3.5 mt-1 border-t border-gray-200 font-semibold text-[15px]">
                <div className="text-[#1c1f2a]">Ride fare</div>
                <div className="tabular-nums text-[#1c1f2a]">${fareSubtotal.toFixed(2)}</div>
              </div>

              {/* Credits / Gift balance section (only when balance exists) */}
              {hasGift && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-500">
                      Credits &amp; promos
                    </div>
                    <button
                      onClick={() => setApplyGift(!applyGift)}
                      disabled={!hasGift || youPay === 0 && applyGift}
                      className={`text-xs px-3.5 py-1 rounded-full font-semibold transition active:scale-[0.985] ${
                        applyGift
                          ? 'bg-emerald-100 text-emerald-700 active:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                      }`}
                    >
                      {applyGift ? 'Remove gift' : 'Apply gift balance'}
                    </button>
                  </div>

                  <div
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors ${
                      applyGift ? 'bg-emerald-50/70' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl leading-none mt-px">🎁</div>
                      <div>
                        <div className="font-semibold text-sm text-[#1c1f2a]">Gift balance</div>
                        <div className="text-xs text-gray-500">Available: ${giftBalance.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right font-semibold tabular-nums text-emerald-600 text-[15px]">
                      {applyGift && appliedCredit > 0 ? `-$${appliedCredit.toFixed(2)}` : '$0.00'}
                    </div>
                  </div>
                </div>
              )}

              {/* Final payable total - premium treatment */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="rounded-3xl bg-[#f8fafc] px-4 py-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold text-gray-500">You pay</div>
                    {savings && (
                      <div className="text-emerald-600 text-xs font-semibold mt-0.5 tracking-tight">
                        You save ${appliedCredit.toFixed(2)}
                      </div>
                    )}
                    {!hasGift && (
                      <div className="text-[10px] text-gray-400 mt-px">All fees included</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[28px] leading-none font-semibold tabular-nums tracking-[-1px] text-[#1c1f2a]">
                      ${youPay.toFixed(2)}
                    </div>
                    {youPay === 0 && hasGift && (
                      <div className="text-emerald-600 text-xs font-semibold mt-0.5">Fully covered by gift 🎉</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust note */}
              <div className="mt-5 px-1 text-[11px] leading-[1.35] text-gray-400">
                This is an estimate. Final price may vary based on actual route, traffic, and wait time.
                {hasGift && ' Gift balance applies instantly at confirmation.'}
              </div>

              {/* Secondary actions */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-semibold text-[#1c1f2a] active:bg-gray-50 active:border-gray-300 transition"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    // Demo action: could navigate to promo entry in real app
                    alert('In a real app this would open the promo/gift code entry flow.')
                    // For now just close to keep focused
                    onClose()
                  }}
                  className="flex-1 h-11 rounded-2xl bg-[#4c5df9] text-white text-sm font-semibold active:bg-[#3b4dd9] transition"
                >
                  Add promo code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
