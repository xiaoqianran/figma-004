import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useBooking, GIFT_CODE_AMOUNTS } from '../context/BookingContext'

interface GiftCodePageProps {
  onBack?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  /** Called after a successful redeem (balance already updated in context). Parent should only toast/navigate — not re-credit. */
  onRedeem?: (code: string, amount: number) => void
  onViewWallet?: () => void
}

export function GiftCodePage({ onBack, variant = 'dark', showToast, onRedeem, onViewWallet }: GiftCodePageProps) {
  const isDark = variant === 'dark'
  const { redeemGiftCode, giftBalance } = useBooking()
  const [code, setCode] = useState('RIDO20')
  const [redeemed, setRedeemed] = useState(false)
  const [success, setSuccess] = useState<{ code: string; amount: number } | null>(null)

  const bg = isDark ? '#121826' : '#f8fafc'
  const textColor = isDark ? '#f8fafc' : '#161a21'
  const muted = isDark ? '#c5c7d0' : '#6b7280'
  const inputBg = isDark ? '#1e293b' : '#f1f3f5'
  const successGreen = '#16a34a'

  const demoHints = Object.keys(GIFT_CODE_AMOUNTS).slice(0, 4).join(' • ')

  const handleRedeem = () => {
    const trimmed = code.trim()
    if (!trimmed) return

    const result = redeemGiftCode(trimmed)

    if (result.ok) {
      setRedeemed(true)
      // Parent (RideshareApp or gallery) handles toast/nav only — balance already applied
      onRedeem?.(result.code, result.amount)

      setTimeout(() => {
        setRedeemed(false)
        setSuccess({ code: result.code, amount: result.amount })
        setCode('')
      }, 650)
    } else {
      const msg = result.error
      if (showToast) {
        showToast(msg, 'error')
      } else {
        alert(msg)
      }
    }
  }

  const handleBackFromSuccess = () => {
    setSuccess(null)
    onBack?.()
  }

  return (
    <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
      <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-3 pb-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl border flex items-center justify-center active:opacity-70"
          style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}
        >
          <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#161a21'} />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-semibold" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Gift Code</h1>
          {giftBalance > 0 && (
            <div className="text-[11px] font-medium" style={{ color: successGreen }}>
              Balance: ${giftBalance}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col">
        {/* Promo header text */}
        <div className="mt-2">
          <div className="text-[21px] font-semibold tracking-[-0.3px]" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>
            Have a promo code?
          </div>
          <p className="mt-2 text-[15px] leading-snug" style={{ color: muted }}>
            Enter your promo code below to redeem it.
          </p>
        </div>

        {/* Input (hidden / disabled in success state) */}
        {!success && (
          <div className="mt-7">
            <div 
              className="rounded-2xl px-6 py-[18px] flex items-center"
              style={{ backgroundColor: inputBg }}
            >
              <input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                disabled={redeemed}
                className="flex-1 bg-transparent text-[21px] font-semibold outline-none tracking-[1.5px] disabled:opacity-70"
                style={{ color: textColor, fontFamily: 'Sen, system-ui, sans-serif' }}
              />
            </div>
            <div className="mt-2 text-[11px] px-1" style={{ color: muted }}>
              Try: {demoHints}
            </div>
          </div>
        )}

        {/* Big Gift Illustration OR Success state */}
        <div className="flex-1 flex items-center justify-center relative my-6">
          {success ? (
            <div className="text-center px-4">
              <div className="mx-auto mb-4 text-7xl">🎉</div>
              <div className="text-[22px] font-semibold tracking-[-0.3px]" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>
                Code redeemed!
              </div>
              <div className="mt-2 text-[18px] font-semibold" style={{ color: successGreen }}>
                ${success.amount} added to your gift balance
              </div>
              <div className="mt-1.5 text-sm" style={{ color: muted }}>
                Promo code <span className="font-mono">{success.code}</span> applied successfully
              </div>
              <div className="mt-4 text-xs px-3 py-1 rounded-full inline-block" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f3f5', color: muted }}>
                Balance updated in Profile, Settings &amp; Wallet
              </div>
            </div>
          ) : (
            <div className="relative w-[210px] h-[210px]">
              {/* Background glow */}
              <div className="absolute inset-6 rounded-full" style={{ background: isDark ? '#e4995f1f' : '#fef3e8' }} />

              {/* Gift box illustration */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[138px] h-[118px]">
                {/* Box body */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[118px] h-[78px] rounded-xl" style={{ backgroundColor: '#f0f0f0' }} />
                {/* Lid */}
                <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 w-[130px] h-[44px] rounded-xl" style={{ backgroundColor: '#f0f0f0' }} />

                {/* Ribbon */}
                <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-[20px] h-[78px] rounded" style={{ backgroundColor: '#ffac70' }} />
                <div className="absolute bottom-[70px] left-1/2 -translate-x-1/2 w-[84px] h-[18px] rounded" style={{ backgroundColor: '#ffab6a' }} />

                {/* Bow */}
                <div className="absolute left-1/2 top-[28px] -translate-x-1/2 w-9 h-9 rounded-full" style={{ backgroundColor: '#ef624c' }} />
                <div className="absolute left-[47%] top-[34px] w-[22px] h-[12px] rounded" style={{ backgroundColor: '#f87561' }} />

                {/* Big $ sign */}
                <div className="absolute -top-1 -left-2 text-[64px] font-semibold" style={{ color: isDark ? '#f8fafc' : '#121826', fontFamily: 'Poppins, system-ui, sans-serif' }}>$</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-2">
        {success ? (
          <div className="space-y-2.5">
            {onViewWallet && (
              <button 
                onClick={() => {
                  onViewWallet()
                }}
                className="w-full h-[54px] rounded-2xl border border-[#4c5df9] text-[#4c5df9] text-[17px] font-semibold active:bg-[#f0f4ff] transition"
              >
                View in Wallet
              </button>
            )}
            <button 
              onClick={handleBackFromSuccess}
              className="btn-primary w-full h-[54px] text-[17px] font-semibold"
            >
              {onViewWallet ? 'Done' : 'Return to Settings'}
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={handleRedeem}
              disabled={!code.trim() || redeemed}
              className="btn-primary w-full h-[54px] text-[17px] font-semibold disabled:opacity-60"
            >
              {redeemed ? 'Applying...' : 'Redeem Code'}
            </button>

            <button 
              onClick={() => {
                if (showToast) {
                  showToast(`Supported codes: ${demoHints} (demo)`, 'info')
                } else {
                  alert(`Supported demo codes: ${demoHints}`)
                }
              }}
              className="w-full text-center mt-4 text-sm underline"
              style={{ color: '#4c5df9' }}
            >
              View Supported codes
            </button>
          </>
        )}
      </div>
    </div>
  )
}
