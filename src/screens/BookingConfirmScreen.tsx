import { useState } from 'react'
import { ArrowLeft, Users, Star, CreditCard } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FareBreakdown } from '../components/ui/FareBreakdown'

interface BookingConfirmScreenProps {
  onBack?: () => void
  onConfirm?: () => void
  onAddPayment?: () => void
}

export function BookingConfirmScreen({ onBack, onConfirm, onAddPayment }: BookingConfirmScreenProps) {
  const { state, setPaymentMethod, giftBalance } = useBooking()
  const { destination, selectedRide, paymentMethod, pickup, paymentMethods } = state

  const [isFareOpen, setIsFareOpen] = useState(false)

  if (!selectedRide || !destination) {
    return (
      <div className="screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">No ride selected</div>
      </div>
    )
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Design system StatusBar */}
      <StatusBar variant="light" />

      {/* Header */}
      <div className="px-5 pt-3 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="font-semibold text-[21px]">Confirm your ride</div>
        </div>
      </div>

      {/* Ride summary card - using design system Card */}
      <Card className="mx-4" padding="lg">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 flex-shrink-0 flex items-center justify-center text-4xl">
            🚗
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-[19px]">{selectedRide.name}</div>
                <div className="text-gray-500 text-sm">{selectedRide.type} • {selectedRide.seats} seats</div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setIsFareOpen(true)}
                  className="text-right active:opacity-80 transition focus:outline-none"
                  aria-label="View fare breakdown and price details"
                >
                  <div className="font-semibold text-2xl tabular-nums">{selectedRide.priceDisplay}</div>
                  <div className="text-emerald-600 text-xs font-medium flex items-center justify-end gap-1">
                    +{selectedRide.eta}
                    <span className="ml-1 text-[#4c5df9] underline decoration-dotted decoration-1 underline-offset-2 text-[10px] font-semibold">Details</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-px rounded">
                <Star size={14} className="text-amber-500" /> <span className="font-medium">{selectedRide.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Users size={14} /> {selectedRide.seats} seats
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Route summary */}
      <Card className="mx-4 mt-4" padding="md">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4c5df9] mt-1" />
            <div className="w-px h-7 bg-gray-300 mx-auto my-1" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#4c5df9] bg-white" />
          </div>
          <div className="flex-1 space-y-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs">PICKUP</div>
              <div className="font-medium text-[#1c1f2a]">{pickup?.address}</div>
              {pickup?.subtitle && <div className="text-gray-500 text-xs">{pickup.subtitle}</div>}
            </div>
            <div>
              <div className="text-gray-500 text-xs">DROP-OFF</div>
              <div className="font-medium text-[#1c1f2a]">{destination.address}</div>
              {destination.subtitle && <div className="text-gray-500 text-xs">{destination.subtitle}</div>}
            </div>
          </div>
        </div>
      </Card>

      {/* Payment section - now allows choosing/switching methods (wired to BookingContext) */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-xs uppercase tracking-widest font-medium text-gray-500">PAYMENT</div>
          <button 
            onClick={onAddPayment}
            className="text-[#4c5df9] text-xs font-semibold flex items-center gap-1 active:opacity-70"
          >
            <CreditCard size={13} /> Add new
          </button>
        </div>

        <div className="space-y-2">
          {(paymentMethods || []).map((pm) => {
            const isSelected = paymentMethod?.id === pm.id
            const label = pm.type === 'applepay' ? 'Apple Pay' 
                          : pm.type === 'cash' ? 'Cash' 
                          : `${pm.brand} •••• ${pm.last4 || '••••'}`
            return (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm)}
                className={`w-full bg-white border rounded-2xl px-4 py-3 flex items-center justify-between active:bg-gray-50 transition ${isSelected ? 'border-[#4c5df9] ring-1 ring-[#4c5df9]/20' : 'border-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-base">
                    {pm.type === 'applepay' ? '' : pm.type === 'cash' ? '💵' : '💳'}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-[#1c1f2a]">{label}</div>
                    {pm.isDefault && <div className="text-[10px] text-emerald-600">Default</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-lg tabular-nums text-[#1c1f2a]">{selectedRide.priceDisplay}</div>
                  {isSelected && <div className="text-[#4c5df9] text-sm">✓</div>}
                </div>
              </button>
            )
          })}
        </div>
        <div className="text-[11px] text-center text-gray-400 mt-2">Tap a method to switch</div>
      </div>

      {/* Fine print */}
      <div className="px-5 mt-4 text-[11px] text-center text-gray-400">
        By confirming, you agree to our Terms and Cancellation Policy
      </div>

      {/* CTA - using design system Button */}
      <div className="mt-auto px-5 pb-8 pt-2 bg-[#f8fafc]">
        <Button 
          onClick={onConfirm}
          fullWidth
          className="h-[56px] text-[17px]"
        >
          Confirm &amp; Book Ride
        </Button>
        <div className="text-center mt-3 text-xs text-gray-400">You can cancel for free within 2 minutes</div>
      </div>

      {/* Fare breakdown / price details modal - triggered from ride price or Details link */}
      <FareBreakdown
        isOpen={isFareOpen}
        onClose={() => setIsFareOpen(false)}
        ride={selectedRide}
        giftBalance={giftBalance}
      />
    </div>
  )
}
