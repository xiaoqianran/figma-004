
import { useState, useEffect } from 'react'
import { Filter, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking, RideOption } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { TopBar } from '../components/ui/TopBar'
import { RideCard } from '../components/ui/RideCard'
import { Button } from '../components/ui/Button'
import { FareBreakdown } from '../components/ui/FareBreakdown'

const carOptions: RideOption[] = [
  { id: 101, name: 'Tesla Model 3', type: 'Electric', price: 12.4, priceDisplay: '$12.40', eta: '3 min', rating: 4.98, seats: 4 },
  { id: 102, name: 'Toyota Camry', type: 'Comfort', price: 8.9, priceDisplay: '$8.90', eta: '5 min', rating: 4.85, seats: 4 },
  { id: 103, name: 'Honda CR-V', type: 'SUV', price: 14.2, priceDisplay: '$14.20', eta: '7 min', rating: 4.91, seats: 5 },
  { id: 104, name: 'BMW 330i', type: 'Premium', price: 18.75, priceDisplay: '$18.75', eta: '4 min', rating: 4.95, seats: 4 },
]

// Filter & Sort types (local to this screen)
type SortOption = 'price-low' | 'price-high' | 'eta-fastest' | 'rating-highest'
type VehicleType = 'All' | 'Electric' | 'Comfort' | 'SUV' | 'Premium'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price-low', label: 'Price (low-high)' },
  { value: 'price-high', label: 'Price (high-low)' },
  { value: 'eta-fastest', label: 'ETA (fastest)' },
  { value: 'rating-highest', label: 'Rating (highest)' },
]

const VEHICLE_TYPES: VehicleType[] = ['All', 'Electric', 'Comfort', 'SUV', 'Premium']

const DEFAULT_SORT: SortOption = 'price-low'
const DEFAULT_TYPE: VehicleType = 'All'

interface CarResultScreenProps {
  onBack?: () => void
  onSelectRide?: (ride: RideOption) => void
  onConfirmRide?: () => void
  // Legacy gallery support
  onConfirm?: () => void
  showToast?: (message: string) => void
}

export function CarResultScreen({ onBack, onSelectRide, onConfirmRide }: CarResultScreenProps) {
  const { state, selectRide, giftBalance } = useBooking()
  const [selectedId, setSelectedId] = useState<number | null>(state.selectedRide?.id || null)

  // Fare breakdown modal state
  const [isFareOpen, setIsFareOpen] = useState(false)
  const [fareRide, setFareRide] = useState<RideOption | null>(null)

  // Filter / Sort state (reactive + session-persisted)
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT)
  const [vehicleType, setVehicleType] = useState<VehicleType>(DEFAULT_TYPE)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pendingSort, setPendingSort] = useState<SortOption>(DEFAULT_SORT)
  const [pendingType, setPendingType] = useState<VehicleType>(DEFAULT_TYPE)

  // Load persisted preferences for the session (localStorage survives reloads/nav)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carResultFilters')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.sort && SORT_OPTIONS.some(o => o.value === parsed.sort)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSort(parsed.sort)
        }
        if (parsed.vehicleType && VEHICLE_TYPES.includes(parsed.vehicleType)) {
          setVehicleType(parsed.vehicleType)
        }
      }
    } catch {
      // ignore bad storage
    }
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('carResultFilters', JSON.stringify({ sort, vehicleType }))
    } catch {
      // ignore
    }
  }, [sort, vehicleType])

  const handleSelect = (ride: RideOption) => {
    const wasDifferentSelection = selectedId !== ride.id
    setSelectedId(ride.id)
    selectRide(ride)
    onSelectRide?.(ride)
    // When user selects a *different* ride while the FareBreakdown modal is open,
    // auto-close it so the modal never shows stale ride data. (Integrates cleanly with selection state.)
    if (wasDifferentSelection && isFareOpen) {
      setIsFareOpen(false)
    }
  }

  const openFareBreakdown = (ride: RideOption) => {
    setFareRide(ride)
    setIsFareOpen(true)
  }

  const selectedRide = carOptions.find(c => c.id === selectedId)

  // Compute filtered + sorted list (drives the UI)
  const displayedCars = (() => {
    let result = [...carOptions]

    // Apply vehicle type filter
    if (vehicleType !== 'All') {
      result = result.filter((c) => c.type === vehicleType)
    }

    // Apply sort
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'eta-fastest':
        result.sort((a, b) => parseInt(a.eta, 10) - parseInt(b.eta, 10))
        break
      case 'rating-highest':
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  })()

  const hasActiveFilters = vehicleType !== DEFAULT_TYPE || sort !== DEFAULT_SORT
  const activeFilterCount =
    (vehicleType !== DEFAULT_TYPE ? 1 : 0) + (sort !== DEFAULT_SORT ? 1 : 0)

  // Open sheet and sync pending values from live state
  const openFilterSheet = () => {
    setPendingSort(sort)
    setPendingType(vehicleType)
    setIsFilterOpen(true)
  }

  const closeFilterSheet = () => {
    setIsFilterOpen(false)
  }

  const handleReset = () => {
    setPendingSort(DEFAULT_SORT)
    setPendingType(DEFAULT_TYPE)
  }

  const handleApply = () => {
    setSort(pendingSort)
    setVehicleType(pendingType)
    setIsFilterOpen(false)
  }

  return (
    <div className="screen bg-white flex flex-col relative">
      {/* StatusBar + TopBar + Filter action */}
      <StatusBar variant="light" />
      <TopBar
        onBack={onBack}
        variant="light"
        title="Choose a ride"
        subtitle={`${displayedCars.length} results near you`}
        rightAction={
          <button
            onClick={openFilterSheet}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition active:bg-gray-50 ${
              hasActiveFilters
                ? 'border-[#4c5df9] text-[#4c5df9]'
                : 'border-gray-200 text-[#1c1f2a]'
            }`}
          >
            <Filter size={16} />
            Filter
            {hasActiveFilters && (
              <div className="ml-0.5 w-4 h-4 rounded-full bg-[#4c5df9] text-white text-[9px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </div>
            )}
          </button>
        }
      />

      {/* Car list - using RideCard component (major duplication removal). Reacts to active sort + type filter. */}
      <div className="flex-1 px-5 space-y-3 overflow-y-auto pb-5">
        {displayedCars.length > 0 ? (
          displayedCars.map((car) => {
            const isSelected = selectedId === car.id
            return (
              <button
                key={car.id}
                onClick={() => handleSelect(car)}
                className={`relative w-full text-left border rounded-3xl overflow-hidden transition ${isSelected ? 'border-[#4c5df9] ring-1 ring-[#4c5df9]/15 shadow-sm' : 'border-gray-100 active:bg-gray-50'}`}
              >
                <RideCard
                  name={car.name}
                  type={car.type}
                  price={car.priceDisplay}
                  time={car.eta}
                  rating={String(car.rating)}
                  seats={car.seats}
                />
                {/* Price area tap target (for selected ride only): enables "tapping the price area" to open FareBreakdown per requirements.
                    Transparent hit box over the price+eta region rendered by RideCard. Subtle active state for tap feedback.
                    Does not affect selection for unselected rides; stops propagation when active. */}
                {isSelected && (
                  <div
                    className="absolute top-[14px] right-[14px] z-20 w-[100px] h-14 cursor-pointer active:bg-black/[0.035] rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFareBreakdown(car)
                    }}
                    aria-label="View detailed fare breakdown for selected ride price"
                    title="Tap price for fare details"
                  />
                )}
                {isSelected && (
                  <div className="absolute right-4 bottom-4 text-[#4c5df9] z-10">
                    <Check size={16} />
                  </div>
                )}
                {/* Premium fare details affordance - only for the selected ride (tap target per requirements) */}
                {isSelected && (
                  <div
                    className="border-t border-gray-100 bg-[#f8fafc] px-4 py-2.5 flex items-center justify-between text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFareBreakdown(car)
                    }}
                  >
                    <span className="font-semibold text-[#4c5df9] flex items-center gap-1">
                      View fare breakdown
                      <span aria-hidden="true">→</span>
                    </span>
                    <span className="text-gray-400 font-medium">Tap to see full price details</span>
                  </div>
                )}
              </button>
            )
          })
        ) : (
          <div className="pt-12 text-center">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-medium text-[#1c1f2a]">No rides match your filters</div>
            <button
              onClick={() => {
                setSort(DEFAULT_SORT)
                setVehicleType(DEFAULT_TYPE)
              }}
              className="mt-4 text-[#4c5df9] text-sm font-medium active:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA - using Button */}
      <div className="p-5 border-t bg-white">
        <Button 
          onClick={() => {
            onConfirmRide?.()
          }}
          disabled={!selectedRide}
          fullWidth
          className="h-[52px] text-base"
        >
          {selectedRide ? `Select ${selectedRide.name}` : 'Choose a ride'}
        </Button>
      </div>

      {/* ========== FILTER BOTTOM SHEET (high-fidelity, framer-motion powered) ========== */}
      {/* Works in gallery mode and full-flow (RideshareApp). Uses absolute positioning so it stays inside PhoneFrame. */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50 z-[80]"
              onClick={closeFilterSheet}
            />

            {/* Sheet */}
            <motion.div
              key="filter-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.9 }}
              className="absolute bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '68%' }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b flex-shrink-0 bg-white">
                <div>
                  <div className="font-semibold text-[19px] tracking-[-0.3px]">Filters</div>
                  <div className="text-xs text-gray-500 -mt-0.5">Sort &amp; refine results</div>
                </div>
                <button
                  onClick={closeFilterSheet}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border border-gray-200 active:bg-gray-100 transition"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                {/* Sort section */}
                <div className="px-5 pt-5">
                  <div className="text-[11px] font-semibold tracking-[1.2px] text-gray-500 mb-3">SORT BY</div>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((option) => {
                      const isActive = pendingSort === option.value
                      return (
                        <button
                          key={option.value}
                          onClick={() => setPendingSort(option.value)}
                          className={`w-full flex items-center justify-between px-4 py-[14px] rounded-2xl text-[15px] font-medium text-left transition-all active:scale-[0.985] ${
                            isActive
                              ? 'bg-[#4c5df9] text-white shadow-sm'
                              : 'bg-[#f8fafc] text-[#1c1f2a] border border-gray-100 active:bg-gray-100'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isActive && <Check size={18} className="opacity-90" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-5 mx-5" />

                {/* Vehicle type section */}
                <div className="px-5 pb-5">
                  <div className="text-[11px] font-semibold tracking-[1.2px] text-gray-500 mb-3">VEHICLE TYPE</div>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLE_TYPES.map((type) => {
                      const isActive = pendingType === type
                      return (
                        <button
                          key={type}
                          onClick={() => setPendingType(type)}
                          className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985] border ${
                            isActive
                              ? 'bg-[#4c5df9] text-white border-[#4c5df9]'
                              : 'bg-white text-[#1c1f2a] border-gray-200 active:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    })}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-3 px-1">Tap to filter the list instantly on Apply</div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="p-4 border-t bg-white flex gap-3 flex-shrink-0">
                <button
                  onClick={handleReset}
                  className="flex-1 h-12 rounded-2xl border border-gray-200 text-sm font-semibold text-[#1c1f2a] active:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 h-12 rounded-2xl bg-[#4c5df9] text-white text-sm font-semibold active:bg-[#3b4dd9] transition shadow-sm"
                >
                  Apply filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fare breakdown modal - accessible by tapping the selected ride's details bar */}
      <FareBreakdown
        isOpen={isFareOpen}
        onClose={() => setIsFareOpen(false)}
        ride={fareRide}
        giftBalance={giftBalance}
      />
    </div>
  )
}
