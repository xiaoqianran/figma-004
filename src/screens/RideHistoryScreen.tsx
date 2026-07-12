import { ArrowLeft, Star, Clock, MapPin } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'

interface RideHistoryScreenProps {
  onBack?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  onRebook?: (ride: {
    bookingId: string
    rideName: string
    price: number
    destination: string
    completedAt: string
    rating?: number
    tip?: number
  }) => void
}

export function RideHistoryScreen({ onBack, showToast: _showToast, onRebook }: RideHistoryScreenProps) {
  const { state } = useBooking()
  const { completedRides, lastRating } = state

  // Merge lastRating into matching history entry (display safety net if archive raced ahead of rating)
  const allRides = completedRides.map((ride) => {
    if (
      lastRating?.bookingId &&
      ride.bookingId === lastRating.bookingId &&
      (ride.rating == null || ride.tip == null)
    ) {
      return {
        ...ride,
        rating: ride.rating ?? lastRating.rating,
        tip: ride.tip ?? lastRating.tip,
      }
    }
    return ride
  })
  // Promote lastRating into history view if present and not already reflected
  if (lastRating && lastRating.bookingId && !allRides.some(r => r.bookingId === lastRating.bookingId)) {
    allRides.unshift({
      bookingId: lastRating.bookingId,
      rideName: 'Recent Ride',
      price: 0,
      destination: 'Completed',
      completedAt: 'Just now',
      rating: lastRating.rating,
      tip: lastRating.tip,
    })
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      <StatusBar variant="light" />

      <div className="px-5 pt-3 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="font-semibold text-[21px]">Ride History</div>
          <div className="text-xs text-gray-500 -mt-0.5">{allRides.length} completed trips</div>
        </div>
      </div>

      <div className="px-4 pt-4 flex-1 overflow-auto">
        {allRides.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Clock size={42} className="mx-auto mb-3 opacity-40" />
            <div className="font-medium">No rides yet</div>
            <p className="text-sm mt-1">Your completed trips will show up here after you rate them.</p>
          </div>
        )}

        <div className="space-y-3 pb-8">
          {allRides.map((ride, idx) => (
            <Card key={idx} padding="md" className="active:scale-[0.985] transition">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4c5df9]/10 to-[#6366f1]/10 flex items-center justify-center text-3xl flex-shrink-0">
                  🚕
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[17px] text-[#1c1f2a]">{ride.rideName}</div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <MapPin size={14} /> {ride.destination}
                      </div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-semibold text-lg">${ride.price.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400">{ride.completedAt}</div>
                    </div>
                  </div>

                  {/* Only show rating/tip belonging to THIS ride (never bleed lastRating onto other bookings) */}
                  {ride.rating != null && (
                    <div className="mt-3 flex items-center gap-2 text-sm" data-testid={`ride-rating-${ride.bookingId}`}>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: Math.floor(ride.rating) }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <div className="text-gray-500 text-xs font-medium">
                        {ride.rating}.0
                      </div>
                      {ride.tip != null && ride.tip > 0 ? (
                        <div className="ml-2 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-px rounded" data-testid={`ride-tip-${ride.bookingId}`}>
                          +${ride.tip.toFixed(0)} tip
                        </div>
                      ) : null}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 mt-1.5 tracking-wide">Booking #{ride.bookingId}</div>
                </div>
              </div>

              {/* Quick Rebook action - prominent emerald accent button per high-fidelity style */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRebook?.(ride)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 active:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.985] shadow-sm hover:bg-emerald-600"
                  aria-label={`Book again ${ride.rideName}`}
                >
                  ↻ Book again
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t text-center text-[11px] text-gray-400">
        Pull to refresh • Data stored locally for this demo
      </div>
    </div>
  )
}
