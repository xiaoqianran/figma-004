import React from 'react'
import { ArrowLeft, Settings, CreditCard, Bell, Shield, LogOut, ChevronRight } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

interface ProfileScreenProps {
  onBack?: () => void
  onManagePayments?: () => void
  onLogout?: () => void
}

export function ProfileScreen({ onBack, onManagePayments, onLogout }: ProfileScreenProps) {
  const { state, logout } = useBooking()
  const { user, paymentMethod } = state

  const handleLogout = () => {
    logout()
    onLogout?.()
  }

  const menuItems = [
    { icon: CreditCard, label: 'Payment methods', action: onManagePayments, value: paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : 'Add card' },
    { icon: Bell, label: 'Notifications', value: 'On' },
    { icon: Shield, label: 'Privacy & Safety' },
    { icon: Settings, label: 'App settings' },
  ]

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Status bar */}
      <div className="status-bar light px-6 pt-1 text-[#1c1f2a]">
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border active:bg-gray-100">
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="font-semibold text-[22px]">Profile</div>
      </div>

      {/* Profile header */}
      <div className="px-6 py-4 flex items-center gap-4 bg-white mx-4 rounded-3xl border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4c5df9] via-[#6366f1] to-[#4c5df9] flex items-center justify-center text-white text-3xl font-semibold shadow-inner">
          {user?.name?.[0] || 'U'}
        </div>
        <div>
          <div className="font-semibold text-xl text-[#1c1f2a]">{user?.name || 'Guest User'}</div>
          <div className="text-gray-500 text-sm">{user?.email || 'user@meteor.app'}</div>
          <div className="text-emerald-600 text-xs font-medium mt-0.5 flex items-center gap-1">
            ★ 4.92 • 148 rides
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { label: 'Total rides', val: '148' },
          { label: 'CO₂ saved', val: '92kg' },
          { label: 'Avg rating', val: '4.9' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 py-3 text-center">
            <div className="text-xl font-semibold text-[#1c1f2a]">{s.val}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-4 mt-5 space-y-px flex-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full bg-white rounded-2xl px-4 py-4 flex items-center justify-between active:bg-gray-50 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-[#4c5df9]" />
              <span className="font-medium text-[15px] text-[#1c1f2a]">{item.label}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              {item.value && <span className="mr-1 text-right max-w-[120px] truncate">{item.value}</span>}
              <ChevronRight size={18} />
            </div>
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-white text-red-600 rounded-2xl px-4 py-[17px] flex items-center gap-3 active:bg-red-50 border border-gray-100 font-medium"
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>
      </div>

      <div className="text-center text-[10px] text-gray-400 pb-6">Meteor v4.2.1 • San Francisco</div>
    </div>
  )
}
