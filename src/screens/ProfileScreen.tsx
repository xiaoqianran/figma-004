import React, { useState } from 'react'
import { ArrowLeft, Settings, CreditCard, Bell, Shield, LogOut, ChevronRight, Pencil, X, Check } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'

interface ProfileScreenProps {
  onBack?: () => void
  onManagePayments?: () => void
  onLogout?: () => void
  onViewActiveRide?: () => void
  onOpenSettings?: () => void
}

export function ProfileScreen({ onBack, onManagePayments, onLogout, onViewActiveRide, onOpenSettings }: ProfileScreenProps) {
  const { state, logout, updateUser } = useBooking()
  const { user, paymentMethod, activeRide, preferences } = state

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')

  const handleLogout = () => {
    logout()
    onLogout?.()
  }

  const startEdit = () => {
    setEditName(user?.name || '')
    setEditEmail(user?.email || '')
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const saveEdit = () => {
    const trimmedName = editName.trim()
    const trimmedEmail = editEmail.trim()
    if (trimmedName && trimmedEmail) {
      updateUser({ name: trimmedName, email: trimmedEmail })
    }
    setIsEditing(false)
  }

  const notifValue = preferences?.notificationsEnabled ? 'On' : 'Off'
  const menuItems = [
    { icon: CreditCard, label: 'Payment methods', action: onManagePayments, value: paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : 'Add card' },
    { icon: Bell, label: 'Notifications', value: notifValue },
    { icon: Shield, label: 'Privacy & Safety' },
    { icon: Settings, label: 'App settings', action: onOpenSettings },
  ]

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Design system StatusBar */}
      <StatusBar variant="light" />

      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border active:bg-gray-100">
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="font-semibold text-[22px]">Profile</div>
      </div>

      {/* Profile header - tap to edit */}
      <button
        onClick={startEdit}
        className="mx-4 mt-1 px-6 py-4 flex items-center gap-4 bg-white rounded-3xl border border-gray-100 w-[calc(100%-2rem)] text-left active:bg-gray-50 transition"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4c5df9] via-[#6366f1] to-[#4c5df9] flex items-center justify-center text-white text-3xl font-semibold shadow-inner flex-shrink-0">
          {user?.name?.[0] || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xl text-[#1c1f2a] flex items-center gap-2">
            {user?.name || 'Guest User'}
            <Pencil size={14} className="text-[#4c5df9] opacity-70" />
          </div>
          <div className="text-gray-500 text-sm truncate">{user?.email || 'user@meteor.app'}</div>
          <div className="text-emerald-600 text-xs font-medium mt-0.5 flex items-center gap-1">
            ★ 4.92 • 148 rides
          </div>
        </div>
      </button>

      {/* Inline edit form (high-fidelity, appears below header) */}
      {isEditing && (
        <div className="mx-4 mt-3 p-4 bg-white rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="font-semibold text-sm text-[#1c1f2a]">Edit Profile</div>
            <button onClick={cancelEdit} className="text-gray-400 active:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-widest text-gray-500 px-1">Full name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4c5df9]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-gray-500 px-1">Email address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full mt-1 bg-[#f8fafc] border border-gray-200 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#4c5df9]"
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={cancelEdit}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-medium active:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={!editName.trim() || !editEmail.trim()}
              className="flex-1 py-3 rounded-2xl bg-[#4c5df9] text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-[#3a4bd1] disabled:opacity-50"
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
          <div className="text-center text-[10px] text-gray-400 mt-2">Changes update across the app instantly</div>
        </div>
      )}

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

      {/* Active ride summary in Profile (high-value detail) */}
      {activeRide && (
        <div className="px-4 mt-4">
          <Card variant="elevated" padding="sm" className="bg-white border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚕</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1c1f2a]">Ride in progress</div>
                <div className="text-xs text-gray-500 truncate">{activeRide.pickup.address} → {activeRide.destination.address}</div>
              </div>
              <button 
                onClick={() => onViewActiveRide?.()}
                className="text-xs px-3 py-1 bg-emerald-500 text-white rounded-xl font-medium active:bg-emerald-600"
              >
                View
              </button>
            </div>
          </Card>
        </div>
      )}

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
