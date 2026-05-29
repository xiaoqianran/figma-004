import { ArrowLeft, Users, Star } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

interface BookingConfirmScreenProps {
  onBack?: () => void
  onConfirm?: () => void
  onAddPayment?: () => void
}

export function BookingConfirmScreen({ onBack, onConfirm, onAddPayment }: BookingConfirmScreenProps) {
  const { state } = useBooking()
  const { destination, selectedRide, paymentMethod, pickup } = state

  if (!selectedRide || !destination) {
    return (
      <div className="screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">No ride selected</div>
      </div>
    )
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Status bar */}
      <div className="status-bar light px-6 pt-1 text-[#1c1f2a]">
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-5 pt-3 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="font-semibold text-[21px]">Confirm your ride</div>
        </div>
      </div>

      {/* Ride summary card */}
      <div className="mx-4 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
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
                <div className="font-semibold text-2xl tabular-nums">{selectedRide.priceDisplay}</div>
                <div className="text-emerald-600 text-xs font-medium">+{selectedRide.eta}</div>
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
      </div>

      {/* Route summary */}
      <div className="mx-4 mt-4 bg-white rounded-3xl px-5 py-4 border border-gray-100">
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
      </div>

      {/* Payment row */}
      <div className="mx-4 mt-4">
        <div className="text-xs uppercase tracking-widest font-medium text-gray-500 px-1 mb-2">PAYMENT</div>
        <button 
          onClick={onAddPayment}
          className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              💳
            </div>
            <div>
              <div className="font-medium text-sm">{paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : 'Add payment method'}</div>
              <div className="text-xs text-gray-500">Tap to change</div>
            </div>
          </div>
          <div className="font-semibold text-lg tabular-nums text-[#1c1f2a]">{selectedRide.priceDisplay}</div>
        </button>
      </div>

      {/* Fine print */}
      <div className="px-5 mt-4 text-[11px] text-center text-gray-400">
        By confirming, you agree to our Terms and Cancellation Policy
      </div>

      {/* CTA */}
      <div className="mt-auto px-5 pb-8 pt-2 bg-[#f8fafc]">
        <button 
          onClick={onConfirm}
          className="btn-primary w-full h-[56px] text-[17px] font-semibold shadow active:scale-[0.985] transition"
        >
          Confirm & Book Ride
        </button>
        <div className="text-center mt-3 text-xs text-gray-400">You can cancel for free within 2 minutes</div>
      </div>
    </div>
  )
}
