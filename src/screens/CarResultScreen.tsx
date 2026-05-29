
import { useState } from 'react'
import { Filter, Check } from 'lucide-react'
import { useBooking, RideOption } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { TopBar } from '../components/ui/TopBar'
import { RideCard } from '../components/ui/RideCard'
import { Button } from '../components/ui/Button'

const carOptions: RideOption[] = [
  { id: 101, name: 'Tesla Model 3', type: 'Electric', price: 12.4, priceDisplay: '$12.40', eta: '3 min', rating: 4.98, seats: 4 },
  { id: 102, name: 'Toyota Camry', type: 'Comfort', price: 8.9, priceDisplay: '$8.90', eta: '5 min', rating: 4.85, seats: 4 },
  { id: 103, name: 'Honda CR-V', type: 'SUV', price: 14.2, priceDisplay: '$14.20', eta: '7 min', rating: 4.91, seats: 5 },
  { id: 104, name: 'BMW 330i', type: 'Premium', price: 18.75, priceDisplay: '$18.75', eta: '4 min', rating: 4.95, seats: 4 },
]

interface CarResultScreenProps {
  onBack?: () => void
  onSelectRide?: (ride: RideOption) => void
  onConfirmRide?: () => void
  // Legacy gallery support
  onConfirm?: () => void
  showToast?: (message: string) => void
}

export function CarResultScreen({ onBack, onSelectRide, onConfirmRide }: CarResultScreenProps) {
  const { state, selectRide } = useBooking()
  const [selectedId, setSelectedId] = useState<number | null>(state.selectedRide?.id || null)

  const handleSelect = (ride: RideOption) => {
    setSelectedId(ride.id)
    selectRide(ride)
    onSelectRide?.(ride)
  }

  const selectedRide = carOptions.find(c => c.id === selectedId)

  return (
    <div className="screen bg-white flex flex-col">
      {/* StatusBar + TopBar + Filter action */}
      <StatusBar variant="light" />
      <TopBar
        onBack={onBack}
        variant="light"
        title="Choose a ride"
        subtitle="42 results near you"
        rightAction={
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm active:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
        }
      />

      {/* Car list - using RideCard component (major duplication removal) */}
      <div className="flex-1 px-5 space-y-3 overflow-y-auto pb-5">
        {carOptions.map((car) => {
          const isSelected = selectedId === car.id
          return (
            <button
              key={car.id}
              onClick={() => handleSelect(car)}
              className={`w-full text-left border rounded-3xl overflow-hidden transition ${isSelected ? 'border-[#4c5df9] ring-1 ring-[#4c5df9]/15 shadow-sm' : 'border-gray-100 active:bg-gray-50'}`}
            >
              <RideCard
                name={car.name}
                type={car.type}
                price={car.priceDisplay}
                time={car.eta}
                rating={String(car.rating)}
                seats={car.seats}
              />
              {isSelected && (
                <div className="absolute right-4 bottom-4 text-[#4c5df9]">
                  <Check size={16} />
                </div>
              )}
            </button>
          )
        })}
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
    </div>
  )
}
