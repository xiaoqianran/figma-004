
import { ArrowLeft, ChevronRight, CreditCard as CreditCardIcon, Plus } from 'lucide-react'
import { useBooking, PaymentMethod } from '../context/BookingContext'

interface SettingsPageProps {
  onBack?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  onAddPayment?: () => void
  onViewHistory?: () => void
}

interface MenuItem {
  icon: React.ReactNode
  label: string
  color: string
  bg: string
  action?: 'payment' | 'history'
}

export function SettingsPage({ onBack, variant = 'dark', onAddPayment, onViewHistory }: SettingsPageProps) {
  const { state, setPaymentMethod, setNotificationsEnabled, setTheme, updateUser } = useBooking()
  const { user, paymentMethods, paymentMethod, preferences } = state

  // Theme from context pref takes precedence so changing it affects this screen live
  const currentTheme = preferences?.theme || variant
  const isDark = currentTheme === 'dark'

  const bgColor = isDark ? '#121826' : '#f8fafc'
  const textColor = isDark ? '#f8fafc' : '#161a21'
  const cardBg = isDark ? '#121826' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#d9d9df'
  const headerBg = isDark ? '#121826' : '#f8fafc'

  const notifEnabled = preferences?.notificationsEnabled ?? true

  const menuItems: MenuItem[] = [
    { icon: <div className="w-6 h-6 text-white">👤</div>, label: 'My account', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#4c5df966' : '#4c5df9' },
    { icon: <div className="w-6 h-6 text-white">💳</div>, label: 'Payment Card', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#d78d5666' : '#d78d56' },
    { icon: <div className="w-6 h-6 text-white">📍</div>, label: 'Trip History', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#56b7df66' : '#56b7df', action: 'history' },
    { icon: <div className="w-6 h-6 text-white">🎁</div>, label: 'Gift Cards', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#d4509866' : '#d45098' },
    { icon: <div className="w-6 h-6 text-white">✉️</div>, label: 'Message', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#a966ca66' : '#a966ca' },
    { icon: <div className="w-6 h-6 text-white">🚗</div>, label: 'My Trips', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#09a87b66' : '#09a87b' },
    { icon: <div className="w-6 h-6 text-white">⚙️</div>, label: 'Setting', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#9451d766' : '#9451d7' },
    { icon: <div className="w-6 h-6 text-white">❓</div>, label: 'Help', color: isDark ? '#f8fafc' : '#161a21', bg: isDark ? '#ef7c6766' : '#ef7c67' },
  ]

  return (
    <div 
      className="screen flex flex-col overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Status bar */}
      <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-3 pb-4 flex items-center gap-4" style={{ backgroundColor: headerBg }}>
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl border flex items-center justify-center active:opacity-70"
          style={{ borderColor: isDark ? '#334155' : '#e0e0e0' }}
        >
          <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#161a21'} />
        </button>
        <h1 className="text-[20px] font-semibold" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Setting</h1>
      </div>

      {/* Profile header (light variant has prominent one) */}
      {!isDark && (
        <div className="mx-6 mt-4 mb-2">
          <div className="bg-white rounded-3xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-[#4c5df9] to-[#7c6cff] flex items-center justify-center text-white text-xl">{(user?.name || 'PW').slice(0,2).toUpperCase()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg tracking-[-0.3px]" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>{user?.name || 'Porsing Wilson'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || 'user@meteor.app'}</div>
              <button 
                onClick={() => {
                  const newName = prompt('Update name:', user?.name || '')
                  if (newName && newName.trim()) {
                    const newEmail = prompt('Update email:', user?.email || '')
                    if (newEmail && newEmail.trim()) {
                      updateUser({ name: newName.trim(), email: newEmail.trim() })
                    } else {
                      updateUser({ name: newName.trim() })
                    }
                  }
                }}
                className="text-[#4c5df9] text-sm font-semibold underline mt-0.5"
              >
                Edit Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme preference (stored in context, affects Settings rendering live for inner app) */}
      <div className="px-5 mt-1 mb-1">
        <div className="px-1 text-xs uppercase tracking-widest font-medium mb-2" style={{ color: isDark ? '#9fa1b0' : '#6b7280' }}>
          APPEARANCE
        </div>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map((t) => {
            const active = (preferences?.theme || variant) === t
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-medium border transition-all"
                style={{
                  backgroundColor: active ? (isDark ? '#4c5df9' : '#4c5df9') : cardBg,
                  color: active ? '#fff' : textColor,
                  borderColor: active ? '#4c5df9' : cardBorder,
                }}
              >
                {t === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Payment Methods list + add (core functional requirement) */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-xs uppercase tracking-widest font-medium" style={{ color: isDark ? '#9fa1b0' : '#6b7280' }}>
            PAYMENT METHODS
          </div>
          <span className="text-[10px] text-gray-400">{(paymentMethods || []).length} saved</span>
        </div>
        <div className="space-y-2">
          {(paymentMethods || []).map((pm: PaymentMethod) => {
            const isSelected = paymentMethod?.id === pm.id || pm.isDefault
            return (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border active:opacity-90 text-left"
                style={{ backgroundColor: cardBg, borderColor: isSelected ? '#4c5df9' : cardBorder }}
              >
                <div className="w-9 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                  <CreditCardIcon size={16} className={isDark ? 'text-white/80' : 'text-[#1c1f2a]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm" style={{ color: textColor }}>
                    {pm.brand || pm.type} {pm.last4 ? `•••• ${pm.last4}` : ''}
                  </div>
                  <div className="text-[10px]" style={{ color: isDark ? '#9fa1b0' : '#6b7280' }}>
                    {pm.type === 'applepay' ? 'Apple Pay' : pm.type === 'cash' ? 'Cash' : 'Card'}
                  </div>
                </div>
                {isSelected && (
                  <div className="text-xs px-2 py-0.5 rounded-full bg-[#4c5df9] text-white font-medium">Default</div>
                )}
              </button>
            )
          })}
          {(!paymentMethods || paymentMethods.length === 0) && (
            <div className="text-sm text-center py-2 opacity-60">No saved methods</div>
          )}
        </div>
        <button
          onClick={onAddPayment}
          className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium active:bg-gray-50"
          style={{ borderColor: cardBorder, color: '#4c5df9' }}
        >
          <Plus size={16} /> Add new card or method
        </button>
      </div>

      {/* Menu List */}
      <div className="flex-1 px-5 pt-2 pb-8 overflow-y-auto space-y-2.5">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (item.label === 'Payment Card' || item.label === 'My account') {
                onAddPayment?.()
              } else if (item.label === 'Trip History' || (item as { action?: string }).action === 'history') {
                onViewHistory?.()
              } else {
                // graceful demo for other items (no console in production path)
              }
            }}
            className="w-full flex items-center gap-4 px-4 py-[15px] rounded-2xl active:opacity-90 transition-all"
            style={{ 
              backgroundColor: cardBg, 
              border: `1px solid ${cardBorder}` 
            }}
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: item.bg }}
            >
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <div 
                className="font-semibold text-[16px] tracking-[-0.2px]"
                style={{ color: item.color, fontFamily: 'Sen, system-ui, sans-serif' }}
              >
                {item.label}
              </div>
            </div>
            <ChevronRight size={18} style={{ color: isDark ? '#9fa1b0' : '#9fa1b0' }} />
          </button>
        ))}

        {/* Extra interactive toggle for notifications */}
        <div 
          className="w-full flex items-center gap-4 px-4 py-[15px] rounded-2xl mt-1"
          style={{ 
            backgroundColor: cardBg, 
            border: `1px solid ${cardBorder}` 
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#4c5df9]">
            <span className="text-white text-lg">🔔</span>
          </div>
          <div className="flex-1 text-left">
            <div 
              className="font-semibold text-[16px] tracking-[-0.2px]"
              style={{ color: textColor, fontFamily: 'Sen, system-ui, sans-serif' }}
            >
              Notifications
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notifEnabled)}
            className={`w-11 h-6 rounded-full transition-all relative ${notifEnabled ? 'bg-[#4c5df9]' : (isDark ? 'bg-[#334155]' : 'bg-gray-300')}`}
          >
            <div 
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifEnabled ? 'right-0.5' : 'left-0.5'}`} 
            />
          </button>
        </div>
      </div>
    </div>
  )
}
