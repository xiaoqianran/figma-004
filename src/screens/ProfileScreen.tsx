import React, { useState } from 'react'
import { ArrowLeft, Settings, CreditCard, Bell, Shield, LogOut, ChevronRight, Pencil, X, Check, Users, Lock, Download, Share2, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'

interface ProfileScreenProps {
  onBack?: () => void
  onManagePayments?: () => void
  onLogout?: () => void
  onViewActiveRide?: () => void
  onOpenSettings?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  onOpenMessages?: () => void
  onOpenNotifications?: () => void
  onOpenWallet?: () => void
}

export function ProfileScreen({ onBack, onManagePayments, onLogout, onViewActiveRide, onOpenSettings, showToast, onOpenMessages: _onOpenMessages, onOpenNotifications, onOpenWallet }: ProfileScreenProps) {
  const { state, logout, updateUser, unreadCount } = useBooking()
  const { user, paymentMethod, activeRide, giftBalance = 0 } = state

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')

  // Local demo state for privacy panel + toggles (isolated, no reducer needed)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [shareTripStatus, setShareTripStatus] = useState(true)

  // Share Trip modal (available when active ride present)
  const [showShareModal, setShowShareModal] = useState(false)

  // Interactive emergency contacts (was pure toast; now fully functional demo)
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Jamie P. (sister)', phone: '+1 (415) 555-0192' },
    { id: 2, name: 'Sam K. (roommate)', phone: '+1 (650) 555-4411' },
  ])
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')

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

  // Share trip helpers (only meaningful with activeRide)
  const shareLink = activeRide 
    ? `https://meteor.app/trip/${activeRide.bookingId || 'demo-trip-42'}` 
    : 'https://meteor.app/trip/demo-trip-42'

  const handleCopyLinkProfile = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      showToast?.('Trip link copied to clipboard!', 'success')
    } catch {
      showToast?.(`Link: ${shareLink}`, 'info')
    }
  }

  const handleSendViaMessagesProfile = () => {
    showToast?.('Opening Messages composer (demo) — link sent!', 'success')
    setShowShareModal(false)
  }

  const handleShareToWhatsAppProfile = () => {
    showToast?.('Shared via WhatsApp (demo)', 'success')
    setShowShareModal(false)
  }

  const openShareModalProfile = () => {
    if (!activeRide) {
      showToast?.('Start a ride to share live trip status', 'info')
      return
    }
    setShowShareModal(true)
  }

  // Emergency contacts actions (now interactive, no longer dead toast-only)
  const addEmergencyContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return
    const newC = {
      id: Date.now(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
    }
    setEmergencyContacts(prev => [...prev, newC])
    showToast?.(`Added ${newC.name}`, 'success')
    setNewContactName('')
    setNewContactPhone('')
    setShowAddContact(false)
  }

  const removeEmergencyContact = (id: number, name: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id))
    showToast?.(`Removed ${name}`, 'info')
  }

  const menuItems = [
    { icon: CreditCard, label: 'Payment methods', action: onManagePayments, value: paymentMethod ? `${paymentMethod.brand} •••• ${paymentMethod.last4}` : 'Add card' },
    { icon: Wallet, label: 'Wallet & Credits', action: onOpenWallet, value: giftBalance > 0 ? `$${giftBalance}` : 'View' },
    { icon: Bell, label: 'Activity Center', action: onOpenNotifications || (() => showToast?.('Opening notifications & activity...', 'info')), value: unreadCount > 0 ? `${unreadCount} new` : 'View' },
    { icon: Shield, label: 'Privacy & Safety', action: () => setShowPrivacy(true) },
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
          {/* Gift balance hint (updates live after redeeming in GiftCodePage flow) */}
          <div className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${giftBalance > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
            🎁 Gift balance: ${giftBalance}
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onViewActiveRide?.()}
                  className="text-xs px-3 py-1 bg-emerald-500 text-white rounded-xl font-medium active:bg-emerald-600"
                >
                  View
                </button>
                <button 
                  onClick={openShareModalProfile}
                  className="text-xs px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-medium flex items-center gap-1 active:bg-emerald-50"
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
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
              <span className="font-medium text-[15px] text-[#1c1f2a] flex items-center gap-1.5">
                {item.label}
                {item.label === 'Activity Center' && unreadCount > 0 && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" title={`${unreadCount} unread`} />
                )}
              </span>
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

      {/* Privacy & Safety panel - high quality demo content, opens on tap, uses local state + context for toggles */}
      {showPrivacy && (
        <div className="px-4 mt-3 mb-2">
          <Card variant="elevated" padding="md" className="border-[#e0e7ff] bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#4c5df9]" />
                <span className="font-semibold text-[16px] text-[#1c1f2a]">Privacy & Safety</span>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 active:text-gray-600 p-1"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Share trip toggle - uses local demo state */}
              <div className="flex items-center justify-between py-1 px-1 rounded-xl bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <Share2 size={18} className="text-emerald-600" />
                  <div>
                    <div className="font-medium text-[#1c1f2a]">Share trip status</div>
                    <div className="text-[11px] text-gray-500">Send live updates to emergency contacts</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !shareTripStatus
                    setShareTripStatus(next)
                    showToast?.(`Trip sharing ${next ? 'enabled' : 'disabled'}`, 'success')
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative ${shareTripStatus ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${shareTripStatus ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Other privacy info rows */}
              <div className="flex items-center gap-3 py-1 px-1">
                <Lock size={18} className="text-[#4c5df9]" />
                <div className="flex-1">
                  <div className="font-medium text-[#1c1f2a]">Two-factor authentication</div>
                  <div className="text-xs text-emerald-600">Enabled • SMS + app</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">ON</span>
              </div>

              <div className="flex items-center gap-3 py-1 px-1">
                <Users size={18} className="text-[#4c5df9]" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#1c1f2a]">Ride sharing data</div>
                  <div className="text-xs text-gray-500">Used for matching & safety only</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">ON</span>
              </div>

              <div className="flex items-center gap-3 py-1 px-1">
                <div className="text-lg">📍</div>
                <div className="flex-1">
                  <div className="font-medium text-[#1c1f2a]">Location & trip history</div>
                  <div className="text-xs text-gray-500">Auto-deletes after 90 days</div>
                </div>
              </div>

              {/* Emergency contacts */}
              <div className="pt-1 border-t border-gray-100">
                <div className="text-[11px] uppercase tracking-widest text-gray-500 px-1 mb-1.5">EMERGENCY CONTACTS</div>
                <div className="space-y-1 text-xs">
                  {emergencyContacts.length === 0 && (
                    <div className="text-gray-400 px-1 py-1">No contacts yet.</div>
                  )}
                  {emergencyContacts.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-[#f8fafc] px-3 py-2 rounded-xl">
                      <span>{c.name} • {c.phone}</span>
                      <button 
                        onClick={() => removeEmergencyContact(c.id, c.name)}
                        className="text-red-400 active:text-red-600 p-1 -mr-1"
                        aria-label={`Remove ${c.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add contact form (toggled) */}
                {showAddContact && (
                  <div className="mt-2 space-y-2 bg-white border border-gray-100 p-3 rounded-2xl">
                    <input
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Name (e.g. Mom)"
                      className="w-full text-sm bg-[#f8fafc] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#4c5df9]"
                    />
                    <input
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="Phone (e.g. +1 555-1234)"
                      className="w-full text-sm bg-[#f8fafc] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#4c5df9]"
                    />
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => { setShowAddContact(false); setNewContactName(''); setNewContactPhone('') }}
                        className="flex-1 py-1.5 text-xs rounded-xl border active:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={addEmergencyContact}
                        disabled={!newContactName.trim() || !newContactPhone.trim()}
                        className="flex-1 py-1.5 text-xs rounded-xl bg-[#4c5df9] text-white disabled:opacity-50 active:bg-[#3a4bd1]"
                      >
                        Add contact
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="mt-2 text-xs w-full py-2 text-[#4c5df9] font-medium active:bg-[#f0f4ff] rounded-xl flex items-center justify-center gap-1"
                >
                  {showAddContact ? 'Hide add form' : '+ Add emergency contact'}
                </button>
              </div>

              {/* Data actions */}
              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => { showToast?.('Your data export is being prepared (demo) — check email in 5min', 'success') }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-2xl active:bg-gray-50"
                >
                  <Download size={14} /> Download data
                </button>
                <button 
                  onClick={() => { showToast?.('Data deletion request logged. Account will be anonymized in 30d.', 'info') }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-red-200 text-red-600 rounded-2xl active:bg-red-50"
                >
                  Delete my data
                </button>
              </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-3">Your privacy matters. Learn more in Help.</div>
          </Card>
        </div>
      )}

      <div className="text-center text-[10px] text-gray-400 pb-6">Meteor v4.2.1 • San Francisco</div>

      {/* Share Trip modal / sheet for Profile (nice centered modal for variety + polish) */}
      <AnimatePresence>
        {showShareModal && (
          <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShareModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="bg-white w-full max-w-[320px] rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Share2 size={20} className="text-[#4c5df9]" />
                  <span className="font-semibold text-lg tracking-tight">Share your trip</span>
                </div>
                <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 active:text-gray-600"><X size={20} /></button>
              </div>

              <div className="p-5">
                <div className="text-sm text-gray-500 mb-4">Send this link so friends &amp; family can follow your ride live.</div>

                {/* Link box */}
                <div className="bg-[#f8fafc] rounded-2xl border border-gray-200 p-3 mb-4">
                  <div className="text-[10px] text-gray-500 mb-1 px-1">SECURE LINK</div>
                  <div className="font-mono text-xs text-[#1c1f2a] break-all leading-snug">{shareLink}</div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button onClick={handleCopyLinkProfile} className="w-full py-3 rounded-2xl bg-[#4c5df9] active:bg-[#3a4bd1] text-white font-semibold flex items-center justify-center gap-2">
                    Copy link
                  </button>
                  <button onClick={handleSendViaMessagesProfile} className="w-full py-3 rounded-2xl border border-gray-200 active:bg-gray-50 font-medium flex items-center justify-center gap-2">
                    Send via Messages
                  </button>
                  <button onClick={handleShareToWhatsAppProfile} className="w-full py-3 rounded-2xl border border-gray-200 active:bg-gray-50 font-medium flex items-center justify-center gap-2">
                    Share to WhatsApp (demo)
                  </button>
                </div>

                {/* QR placeholder */}
                <div className="mt-5 flex items-center justify-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl border border-gray-200 bg-white p-1.5">
                    <div className="w-full h-full bg-[repeating-linear-gradient(0deg,#1c1f2a_0,#1c1f2a_2px,transparent_2px,transparent_6px),repeating-linear-gradient(90deg,#1c1f2a_0,#1c1f2a_2px,transparent_2px,transparent_6px)] rounded-lg" />
                  </div>
                  <div className="text-left text-[10px] text-gray-400 leading-tight">
                    QR code<br />for quick<br />mobile share
                  </div>
                </div>
              </div>

              <div className="bg-[#f8fafc] px-5 py-3 text-center text-[10px] text-gray-400 border-t">Link valid for this ride only • Tap outside to close</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
