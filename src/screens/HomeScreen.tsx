import { useState } from 'react'
import { MapPin, Clock, Navigation } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { Button } from '../components/ui/Button'

interface HomeScreenProps {
  onBack?: () => void
  onBookRide?: () => void
  onSearchDestination?: () => void
  onQuickDestination?: (dest: { label: string; sub?: string }) => void
  onViewActiveRide?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function HomeScreen({ onBack: _onBack, onBookRide }: HomeScreenProps) {
  const [selectedRideType, setSelectedRideType] = useState<'economy' | 'comfort' | 'xl'>('comfort')
  const [pickup, setPickup] = useState('Current Location')

  const rideTypes = [
    { id: 'economy' as const, label: 'Economy', price: '$7.80', eta: '2 min', icon: '🚗' },
    { id: 'comfort' as const, label: 'Comfort', price: '$11.40', eta: '4 min', icon: '🚙' },
    { id: 'xl' as const, label: 'XL', price: '$16.90', eta: '6 min', icon: '🚐' },
  ]

  const quickPlaces = [
    { label: 'Home', sub: '42 Oak Ave', icon: '🏠' },
    { label: 'Work', sub: 'Downtown Tower', icon: '🏢' },
    { label: 'Gym', sub: 'FitZone • 1.2km', icon: '🏋️' },
  ]

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* StatusBar (design system) */}
      <StatusBar variant="light" />

      {/* Top greeting + avatar */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Good morning</div>
          <div className="font-semibold text-xl -mt-0.5" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Porsing Wilson</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4c5df9] to-violet-500 flex items-center justify-center text-white font-bold shadow">PW</div>
      </div>

      {/* Search bar */}
      <div className="px-5 pt-1 pb-3">
        <button 
          onClick={() => alert('Search destinations (opens destination picker demo)')}
          className="w-full bg-white shadow-sm border border-gray-100 rounded-3xl px-5 py-[15px] flex items-center gap-3 active:bg-gray-50"
        >
          <MapPin className="text-[#4c5df9]" size={21} />
          <div className="flex-1 text-left">
            <div className="text-sm text-gray-500">Where to?</div>
            <div className="font-medium text-base -mt-0.5">Search destination or address</div>
          </div>
          <Navigation size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Map placeholder - rich visual */}
      <div className="relative mx-4 h-[232px] rounded-3xl overflow-hidden shadow-inner border border-gray-200" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 45%, #a5b4fc 100%)' }}>
        {/* Fake map roads */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[38%] left-0 right-0 h-[3px] bg-[#64748b] rotate-[8deg]" />
          <div className="absolute top-[58%] left-0 right-0 h-[2.5px] bg-[#64748b]" />
          <div className="absolute left-[22%] top-0 bottom-0 w-[2.5px] bg-[#64748b] rotate-[-12deg]" />
          <div className="absolute left-[67%] top-0 bottom-0 w-[4px] bg-[#64748b]" />
        </div>

        {/* Location pin on map */}
        <div className="absolute left-[38%] top-[42%] flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#4c5df9] flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="h-3 w-[2px] bg-[#4c5df9]" />
        </div>

        {/* Fake building blocks */}
        <div className="absolute right-6 top-7 w-9 h-6 bg-white/70 rounded-sm" />
        <div className="absolute right-14 top-12 w-7 h-9 bg-white/60 rounded-sm" />
        <div className="absolute left-7 bottom-9 w-8 h-8 bg-white/50 rounded" />

        {/* Overlay labels */}
        <div className="absolute top-3 left-3 bg-white/90 text-[#1c1f2a] text-xs px-2.5 py-px rounded-full font-medium shadow">3 min away</div>
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 rounded-xl text-xs font-semibold flex items-center gap-1">
          <Clock size={13} /> Peak hours
        </div>

        {/* Current location badge */}
        <div 
          onClick={() => setPickup('Home • 42 Oak Ave')}
          className="absolute bottom-4 left-4 bg-white rounded-2xl px-3.5 py-1.5 text-sm shadow flex items-center gap-2 active:scale-[0.985]"
        >
          <div className="text-[#4c5df9]"><MapPin size={15} /></div>
          <span className="font-medium text-xs tracking-tight">{pickup}</span>
        </div>
      </div>

      {/* Quick places */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="uppercase tracking-[1px] text-[10px] font-semibold text-gray-400">SAVED PLACES</div>
          <button className="text-[#4c5df9] text-sm font-medium">See all</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {quickPlaces.map((p, i) => (
            <button 
              key={i}
              onClick={() => alert(`Set destination to ${p.label}`)}
              className="flex-shrink-0 bg-white border border-gray-100 rounded-2xl px-4 py-3 min-w-[108px] text-left active:bg-gray-50"
            >
              <div className="text-xl mb-0.5">{p.icon}</div>
              <div className="font-semibold text-sm">{p.label}</div>
              <div className="text-[11px] text-gray-500 truncate">{p.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Ride type selector */}
      <div className="px-5 pt-5 pb-2 flex-1">
        <div className="uppercase tracking-[1px] text-[10px] font-semibold text-gray-400 mb-2 px-0.5">CHOOSE RIDE</div>
        
        <div className="grid grid-cols-3 gap-2">
          {rideTypes.map((rt) => {
            const active = selectedRideType === rt.id
            return (
              <button
                key={rt.id}
                onClick={() => setSelectedRideType(rt.id)}
                className={`rounded-2xl p-3 border transition-all text-left ${active ? 'border-[#4c5df9] bg-[#eef3ff]' : 'border-gray-100 bg-white active:bg-gray-50'}`}
              >
                <div className="text-2xl mb-1">{rt.icon}</div>
                <div className="font-semibold text-sm">{rt.label}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-semibold text-lg tabular-nums">{rt.price}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">{rt.eta}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="p-5 pt-1 bg-white border-t border-gray-100">
        <Button 
          onClick={() => {
            if (onBookRide) onBookRide()
            else alert(`Requesting ${selectedRideType} ride from ${pickup} (demo)`)
          }}
          fullWidth
          className="h-[54px] text-lg flex items-center justify-center gap-2"
        >
          <span>Request {selectedRideType.charAt(0).toUpperCase() + selectedRideType.slice(1)}</span>
          <span className="opacity-70 text-base">• 3 min</span>
        </Button>
        <div className="text-center text-[10px] text-gray-400 mt-2 tracking-wider">42 drivers nearby • Safe &amp; insured</div>
      </div>
    </div>
  )
}
