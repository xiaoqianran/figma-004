import { useState } from 'react'
import { MapPin, Clock, Navigation, Bell } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useBooking } from '../context/BookingContext'

interface HomeScreenProps {
  onBack?: () => void
  onBookRide?: () => void
  onSearchDestination?: () => void
  onQuickDestination?: (dest: { label?: string; sub?: string; address?: string } | string) => void
  onViewActiveRide?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  onOpenNotifications?: () => void
}

export function HomeScreen({ onBack: _onBack, onBookRide, onSearchDestination, onQuickDestination, onViewActiveRide, onOpenNotifications }: HomeScreenProps) {
  const { state, setPreferredRideType, unreadCount } = useBooking()
  const { user, activeRide, preferredRideType: selectedRideType = 'comfort', recentDestinations = [] } = state

  const [pickup, setPickup] = useState('Current Location')

  const rideTypes = [
    { id: 'economy' as const, label: 'Economy', price: '$7.80', eta: '2 min', icon: '🚗' },
    { id: 'comfort' as const, label: 'Comfort', price: '$11.40', eta: '4 min', icon: '🚙' },
    { id: 'xl' as const, label: 'XL', price: '$16.90', eta: '6 min', icon: '🚐' },
  ]

  // Enhanced quick places with variety, ETA for realism (still call onQuickDestination)
  const quickPlaces = [
    { label: 'Home', sub: '42 Oak Ave', icon: '🏠', eta: '2' },
    { label: 'Work', sub: 'Downtown Tower', icon: '🏢', eta: '8' },
    { label: 'Gym', sub: 'FitZone • 1.2km', icon: '🏋️', eta: '5' },
    { label: 'Coffee', sub: 'Blue Bottle', icon: '☕', eta: '3' },
  ]

  // 3-4 tappable hotspots for richer interactive map (per "可点击热点")
  const mapHotspots = [
    { id: 'dt', label: 'Downtown', sub: '5 min', style: { top: '20%', left: '55%' } },
    { id: 'ap', label: 'Airport', sub: '12 min', style: { bottom: '32%', right: '6%' }, surge: '1.4×' },
    { id: 'md', label: 'Mission', sub: '4 min', style: { top: '52%', left: '8%' } },
    { id: 'fb', label: 'Ferry Bldg', sub: '7 min', style: { top: '15%', right: '28%' } },
  ]

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* StatusBar (design system) */}
      <StatusBar variant="light" />

      {/* Top greeting + avatar + notifications bell (wired to Activity Center).
          Bell + optional unread badge (from BookingContext unreadCount) is the primary entrypoint to NotificationsScreen.
          Taps open as overlay (full-flow) or direct nav (gallery) via the onOpenNotifications prop. */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Good morning</div>
          <div className="font-semibold text-xl -mt-0.5" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>{user?.name || 'Porsing Wilson'}</div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bell icon with live unread badge from context (first-class notifications integration) */}
          <button
            onClick={() => onOpenNotifications?.()}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 active:bg-gray-100 text-gray-600 active:text-[#4c5df9] transition"
            aria-label="Open notifications and activity center"
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-[5px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4c5df9] to-violet-500 flex items-center justify-center text-white font-bold shadow text-sm tracking-tight">
            {(user?.name || 'PW').split(/\s+/).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Current ride summary (high-value polish for Full-Flow) */}
      {activeRide && (
        <div className="px-5 pb-2">
          <Card variant="elevated" padding="sm" className="border-emerald-100 bg-emerald-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg">🚕</div>
                <div>
                  <div className="font-semibold text-sm text-emerald-800 tracking-tight">Active ride • {activeRide.ride.name}</div>
                  <div className="text-emerald-700 text-xs">{activeRide.destination.address} • {activeRide.status.replace('_', ' ')}</div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onViewActiveRide?.()}
                className="h-8 px-3 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                Track
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Search bar */}
      <div className="px-5 pt-1 pb-3">
        <button 
          onClick={() => onSearchDestination?.()}
          className="w-full bg-white shadow-sm border border-gray-100 rounded-3xl px-5 py-[15px] flex items-center gap-3 active:bg-gray-50"
        >
          <MapPin className="text-[#4c5df9]" size={21} />
          <div className="flex-1 text-left">
            <div className="text-sm text-gray-500">Where to?</div>
            <div className="font-medium text-base -mt-0.5">Search destinations</div>
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

        {/* Interactive tappable hotspots (可点击热点) - subtle pill badges, press active states */}
        {mapHotspots.map((h) => (
          <button
            key={h.id}
            onClick={() => onQuickDestination?.({ label: h.label, sub: h.sub })}
            className="absolute z-20 bg-white/95 text-[#1c1f2a] text-[10px] font-medium px-2 py-[2px] rounded-full shadow-sm border border-gray-200/70 flex items-center gap-1 active:scale-[0.93] active:bg-white active:shadow active:ring-1 active:ring-[#4c5df9]/30 transition-all select-none"
            style={h.style as React.CSSProperties}
            aria-label={`Quick destination: ${h.label}`}
          >
            <span>{h.label}</span>
            <span className="text-emerald-600 text-[9px] font-normal tabular-nums tracking-tight">{h.sub}</span>
            {h.surge && (
              <span className="text-[8px] leading-none bg-orange-500 text-white px-1 rounded font-semibold ml-0.5 py-px"> {h.surge}</span>
            )}
          </button>
        ))}

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
          <button 
            onClick={() => onSearchDestination?.()}
            className="text-[#4c5df9] text-sm font-medium active:text-[#3a4bd1] active:scale-[0.985] transition-all"
            aria-label="See all saved places"
          >
            See all
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {quickPlaces.map((p, i) => (
            <button 
              key={i}
              onClick={() => onQuickDestination?.(p)}
              className="flex-shrink-0 bg-white border border-gray-100 rounded-2xl px-4 py-3 min-w-[108px] text-left active:bg-gray-50 active:scale-[0.985] transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="text-xl mb-0.5">{p.icon}</div>
                {p.eta && <div className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 rounded mt-0.5 tabular-nums">{p.eta} min</div>}
              </div>
              <div className="font-semibold text-sm">{p.label}</div>
              <div className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                {p.sub}
                {i === 3 && <span className="inline-block w-1 h-1 bg-emerald-500 rounded-full" title="Live" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular near you - dynamic from BookingContext recentDestinations + live/surge realism badges */}
      {recentDestinations.length > 0 && (
        <div className="px-5 pt-1 pb-1">
          <div className="uppercase tracking-[1px] text-[10px] font-semibold text-gray-400 mb-1 px-0.5 flex items-center gap-1">
            POPULAR NEAR YOU <span className="text-[9px] text-emerald-500 font-normal">• live</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
            {recentDestinations.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => onQuickDestination?.(r)}
                className="flex-shrink-0 bg-white border border-gray-100 rounded-2xl px-3 py-1.5 min-w-[92px] text-left active:bg-gray-50 active:scale-[0.985] transition-transform"
              >
                <div className="font-medium text-xs flex items-center gap-1">
                  📍 {r.address}
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                </div>
                <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  {r.subtitle || 'Nearby'} <span className="text-emerald-600 text-[9px]">3 min</span>
                  {i === 0 && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded">surge</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ride type selector */}
      <div className="px-5 pt-5 pb-2 flex-1">
        <div className="uppercase tracking-[1px] text-[10px] font-semibold text-gray-400 mb-2 px-0.5">CHOOSE RIDE</div>
        
        <div className="grid grid-cols-3 gap-2">
          {rideTypes.map((rt) => {
            const active = selectedRideType === rt.id
            return (
              <button
                key={rt.id}
                onClick={() => setPreferredRideType(rt.id)}
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
            // Remember the chosen ride preference in global BookingContext (drives downstream flows)
            setPreferredRideType(selectedRideType)
            if (onBookRide) onBookRide()
            else onSearchDestination?.() // Start proper booking flow in full-flow
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
