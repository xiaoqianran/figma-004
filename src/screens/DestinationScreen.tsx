
import React, { useState } from 'react'
import { ArrowLeft, MapPin, Plus, Check } from 'lucide-react'
import { useBooking, Location } from '../context/BookingContext'

interface DestinationScreenProps {
  onBack?: () => void
  onConfirmDestination?: (location: Location) => void
  // Legacy support for existing gallery demo
  onSelectPlace?: (destination: string) => void
  showToast?: (msg: string) => void
}

const savedPlaces: Location[] = [
  { address: 'Home', subtitle: '456 Oak Avenue' },
  { address: 'Work', subtitle: '1 Market Street, Tower B' },
  { address: 'Gym', subtitle: '789 Fitness Blvd' },
  { address: 'Parents House', subtitle: '2213 Suburb Rd' },
]

const recentPlaces: Location[] = [
  { address: 'Coffee Shop', subtitle: '2.4 km away • Blue Bottle' },
  { address: 'Whole Foods', subtitle: '1.1 km away' },
]

export function DestinationScreen({ onBack, onConfirmDestination, onSelectPlace, showToast }: DestinationScreenProps) {
  const { state, setDestination } = useBooking()
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<Location | null>(state.destination)

  const handleSelect = (loc: Location) => {
    setSelected(loc)
    setDestination(loc)
    showToast?.(`Selected ${loc.address}`)
  }

  const handleConfirm = () => {
    if (selected) {
      onConfirmDestination?.(selected)
      onSelectPlace?.(selected.address)
    }
  }

  const filteredSaved = savedPlaces.filter(p => 
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="status-bar light px-6 pt-1 text-[#1c1f2a]">
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-3 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="text-xs text-gray-500">Where do you want to go?</div>
          <div className="font-semibold text-lg -mt-0.5">Destination</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6">
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center gap-3 border border-gray-100">
          <MapPin className="text-[#4c5df9]" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or address..." 
            className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400" 
          />
        </div>
      </div>

      {/* Saved Places - interactive */}
      <div className="px-6 mt-5 flex-1 overflow-y-auto pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm text-gray-500 tracking-wider">SAVED PLACES</div>
          <button className="text-[#4c5df9] text-sm font-medium flex items-center gap-1">
            <Plus size={15} /> Add
          </button>
        </div>

        <div className="space-y-2.5">
          {filteredSaved.map((place, i) => {
            const isSelected = selected?.address === place.address
            return (
              <button 
                key={i} 
                onClick={() => handleSelect(place)}
                className={`w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-[15px] border text-left transition ${isSelected ? 'border-[#4c5df9] ring-1 ring-[#4c5df9]/20' : 'border-gray-100 active:bg-gray-50'}`}
              >
                <div className="w-9 h-9 bg-[#eef3ff] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={17} className="text-[#4c5df9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#1c1f2a]">{place.address}</div>
                  <div className="text-xs text-gray-400 truncate">{place.subtitle}</div>
                </div>
                {isSelected ? <div className="text-[#4c5df9]"><Check size={20} /></div> : null}
              </button>
            )
          })}
        </div>

        {/* Recent */}
        <div className="mt-7">
          <div className="text-xs font-semibold text-gray-400 mb-2 px-1 tracking-wider">RECENT</div>
          {recentPlaces.filter(p => p.address.toLowerCase().includes(searchQuery.toLowerCase())).map((place, idx) => {
            const isSelected = selected?.address === place.address
            return (
              <button 
                key={idx} 
                onClick={() => handleSelect(place)}
                className={`w-full mb-2 flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 border text-left ${isSelected ? 'border-[#4c5df9]' : 'border-gray-100 active:bg-gray-50'}`}
              >
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <MapPin size={17} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{place.address}</div>
                  <div className="text-xs text-gray-400">{place.subtitle}</div>
                </div>
                {isSelected && <Check size={18} className="text-[#4c5df9]" />}
              </button>
            )
          })}
        </div>

        {searchQuery.length > 2 && (
          <div className="mt-4">
            <div className="text-xs text-gray-400 px-1 mb-2">SUGGESTIONS</div>
            {['Mission Bay', 'Embarcadero Center', 'Chinatown'].map((s, i) => (
              <button key={i} onClick={() => handleSelect({ address: s, subtitle: 'San Francisco' })} className="w-full text-left px-4 py-3 bg-white rounded-2xl mb-1.5 border border-gray-100 active:bg-gray-50">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirm footer */}
      <div className="p-5 border-t bg-white">
        <button 
          disabled={!selected}
          onClick={handleConfirm}
          className="btn-primary w-full h-[52px] text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selected ? `Confirm ${selected.address}` : 'Select a destination'}
        </button>
      </div>
    </div>
  )
}

