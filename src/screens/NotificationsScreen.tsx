import React, { useState } from 'react'
import { ArrowLeft, CheckCheck, Car, Gift, CreditCard, TrendingDown, Clock, ChevronRight, X, Bell } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'
import { useBooking, type ActivityItem } from '../context/BookingContext'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationsScreenProps {
  onBack?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  onViewHistory?: () => void
  onFindRides?: () => void
}

export function NotificationsScreen({ onBack, showToast, onViewHistory, onFindRides }: NotificationsScreenProps) {
  const {
    activities,
    unreadCount,
    markActivityAsRead,
    markAllActivitiesRead,
  } = useBooking()

  const [filter, setFilter] = useState<'all' | 'rides' | 'offers'>('all')
  const [selected, setSelected] = useState<ActivityItem | null>(null)

  const filteredActivities = React.useMemo(() => {
    if (filter === 'all') return activities
    if (filter === 'rides') {
      return activities.filter(a => a.type === 'ride_completed' || a.type === 'driver_arrived')
    }
    if (filter === 'offers') {
      return activities.filter(a => a.type === 'promo' || a.type === 'price_drop')
    }
    return activities
  }, [activities, filter])

  const handlePress = (act: ActivityItem) => {
    if (!act.read) {
      markActivityAsRead(act.id)
    }
    // Ride-related items with bookingId navigate straight to history (feels connected)
    if ((act.type === 'ride_completed' || act.type === 'driver_arrived') && act.meta?.bookingId && onViewHistory) {
      onViewHistory()
      // Toast hint for context
      showToast?.('Opening ride in History', 'info')
    } else {
      // Everything else (promo, payment, price drop, generic) opens rich detail panel
      setSelected(act)
    }
  }

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return
    markAllActivitiesRead()
    showToast?.('All notifications marked as read', 'success')
  }

  const closeDetail = () => setSelected(null)

  const handleDetailAction = (act: ActivityItem) => {
    closeDetail()
    if ((act.type === 'ride_completed' || act.type === 'driver_arrived') && onViewHistory) {
      onViewHistory()
    } else if (act.type === 'price_drop' && onFindRides) {
      onFindRides()
      showToast?.('Finding rides at the new lower price…', 'success')
    } else if (act.type === 'promo') {
      showToast?.('Gift balance updated in your Profile', 'info')
    } else {
      showToast?.('Thanks! This has been noted.', 'info')
    }
  }

  const getIconForType = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ride_completed': return <Car size={20} className="text-emerald-600" />
      case 'driver_arrived': return <Car size={20} className="text-[#4c5df9]" />
      case 'promo': return <Gift size={20} className="text-amber-500" />
      case 'payment_added': return <CreditCard size={20} className="text-slate-600" />
      case 'price_drop': return <TrendingDown size={20} className="text-emerald-500" />
      default: return <Clock size={20} className="text-gray-500" />
    }
  }

  const getIconBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ride_completed': return 'bg-emerald-100'
      case 'driver_arrived': return 'bg-[#eef3ff]'
      case 'promo': return 'bg-amber-100'
      case 'payment_added': return 'bg-slate-100'
      case 'price_drop': return 'bg-emerald-50'
      default: return 'bg-gray-100'
    }
  }

  const getTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ride_completed': return 'Rides'
      case 'driver_arrived': return 'Rides'
      case 'promo': return 'Offers'
      case 'price_drop': return 'Offers'
      case 'payment_added': return 'Payments'
      default: return 'Activity'
    }
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden relative">
      <StatusBar variant="light" />

      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center gap-3 border-b border-gray-100 bg-white flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[21px] tracking-[-0.3px]">Notifications</div>
          <div className="text-[11px] text-gray-500 -mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread • ` : ''}{activities.length} total
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#4c5df9] active:bg-[#3a4bd1] text-white text-xs font-semibold shadow-sm transition"
          >
            <CheckCheck size={15} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Segmented filter tabs (All / Rides / Offers) */}
      <div className="px-5 pt-3 pb-2 flex gap-2 bg-white border-b border-gray-100 flex-shrink-0">
        {(['all', 'rides', 'offers'] as const).map((tab) => {
          const isActive = filter === tab
          const label = tab === 'all' ? 'All' : tab === 'rides' ? 'Rides' : 'Offers'
          const count = tab === 'all' ? unreadCount : filteredActivities.length
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985] flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-[#4c5df9] text-white shadow'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {label}
              {tab === 'all' && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[15px] h-[15px] px-1 rounded-full bg-white/25 text-[10px] font-bold tabular-nums">
                  {unreadCount}
                </span>
              )}
              {tab !== 'all' && count > 0 && isActive && (
                <span className="text-[10px] opacity-70">({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <div className="font-semibold text-lg text-[#1c1f2a]">Nothing here yet</div>
            <p className="text-sm text-gray-500 mt-1 max-w-[220px]">
              Your ride updates, promos, and alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredActivities.map((act) => (
              <button
                key={act.id}
                onClick={() => handlePress(act)}
                className="w-full text-left active:scale-[0.985] transition-transform"
              >
                <Card
                  padding="md"
                  className={`border transition-all ${!act.read ? 'border-[#4c5df9]/25 bg-[#f8fbff]' : 'border-gray-100'} active:bg-gray-50`}
                >
                  <div className="flex gap-3.5">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconBg(act.type)}`}>
                      {getIconForType(act.type)}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-[15px] text-[#1c1f2a] leading-tight tracking-[-0.1px] pr-1">
                          {act.title}
                        </div>
                        <div className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap pt-0.5">
                          {act.time}
                        </div>
                      </div>

                      <div className="text-[13px] leading-snug text-gray-600 mt-1 pr-2 line-clamp-2">
                        {act.description}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] px-2 py-px rounded-full bg-gray-100 text-gray-500 font-medium tracking-wide">
                          {getTypeLabel(act.type)}
                        </span>

                        {!act.read && (
                          <span className="text-[10px] px-2 py-px rounded-full bg-[#4c5df9] text-white font-semibold">NEW</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-300 mt-3 flex-shrink-0" />
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Demo helper at bottom for "alive" feel */}
        {activities.length > 0 && (
          <div className="mt-6 text-center">
            <div className="text-[10px] text-gray-400">Activity updates automatically after rides &amp; redemptions</div>
          </div>
        )}
      </div>

      {/* Detail "modal" / slide-up panel (used for non-ride items) */}
      <AnimatePresence>
        {selected && (
          <div className="absolute inset-0 z-[60] flex items-end" onClick={closeDetail}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 max-h-[78%] overflow-hidden"
            >
              {/* Detail header */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b bg-white sticky top-0 z-10">
                <div className="flex-1">
                  <div className="uppercase text-[10px] tracking-[1.5px] text-gray-400 font-semibold">DETAIL</div>
                  <div className="font-semibold text-xl tracking-tight text-[#1c1f2a]">{selected.title}</div>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 active:bg-gray-100"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(78vh - 120px)' }}>
                {/* Icon + meta row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBg(selected.type)}`}>
                    {getIconForType(selected.type)}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{getTypeLabel(selected.type)} • {selected.time}</div>
                    {selected.meta?.amount && (
                      <div className="text-emerald-600 font-semibold tabular-nums">+${selected.meta.amount} credited</div>
                    )}
                    {selected.meta?.route && (
                      <div className="text-sm font-medium text-[#1c1f2a]">Route: {selected.meta.route}</div>
                    )}
                  </div>
                </div>

                {/* Main description */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 text-[15px] leading-relaxed text-[#1c1f2a] border border-gray-100">
                  {selected.description}
                </div>

                {/* Contextual extra info per type */}
                {selected.type === 'price_drop' && (
                  <div className="mt-4 text-xs bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-emerald-800">
                    This alert was sent because we detected a fare decrease on your frequent route. Book within the next 45 minutes to lock it in.
                  </div>
                )}
                {selected.type === 'promo' && (
                  <div className="mt-4 text-xs text-gray-500">
                    Credit has been added to your gift balance and can be used on your next booking.
                  </div>
                )}
                {selected.type === 'payment_added' && (
                  <div className="mt-4 text-xs text-gray-500">
                    You can manage all saved cards anytime from Profile &gt; Payments.
                  </div>
                )}
                {(selected.type === 'ride_completed' || selected.type === 'driver_arrived') && selected.meta?.bookingId && (
                  <div className="mt-4 text-xs font-mono text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
                    Booking #{selected.meta.bookingId}
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="p-5 pt-3 border-t bg-white sticky bottom-0">
                <button
                  onClick={() => handleDetailAction(selected)}
                  className="w-full h-12 rounded-2xl bg-[#4c5df9] active:bg-[#3a4bd1] text-white font-semibold text-[15px] flex items-center justify-center gap-2"
                >
                  {selected.type === 'price_drop' ? 'Book rides at new price' :
                   (selected.type === 'ride_completed' || selected.type === 'driver_arrived') ? 'View full ride details in History' :
                   selected.type === 'promo' ? 'Check gift balance' : 'Got it, dismiss'}
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={closeDetail}
                  className="w-full mt-2.5 py-3 text-sm text-gray-500 active:text-gray-700 font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
