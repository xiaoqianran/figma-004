import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface GiftCodePageProps {
  onBack?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function GiftCodePage({ onBack, variant = 'dark' }: GiftCodePageProps) {
  const isDark = variant === 'dark'
  const [code, setCode] = useState('RIDO20')
  const [redeemed, setRedeemed] = useState(false)

  const bg = isDark ? '#121826' : '#f8fafc'
  const textColor = isDark ? '#f8fafc' : '#161a21'
  const muted = isDark ? '#c5c7d0' : '#6b7280'
  const inputBg = isDark ? '#1e293b' : '#f1f3f5'

  const handleRedeem = () => {
    if (code.trim()) {
      setRedeemed(true)
      setTimeout(() => {
        alert(`Promo code "${code}" applied! $8 credit added to your account. (demo)`)
        setRedeemed(false)
        setCode('')
      }, 650)
    }
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
        <h1 className="text-[20px] font-semibold" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Gift Code</h1>
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

        {/* Input */}
        <div className="mt-7">
          <div 
            className="rounded-2xl px-6 py-[18px] flex items-center"
            style={{ backgroundColor: inputBg }}
          >
            <input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 bg-transparent text-[21px] font-semibold outline-none tracking-[1.5px]"
              style={{ color: textColor, fontFamily: 'Sen, system-ui, sans-serif' }}
            />
          </div>
        </div>

        {/* Big Gift Illustration */}
        <div className="flex-1 flex items-center justify-center relative my-6">
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
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-8 pt-2">
        <button 
          onClick={handleRedeem}
          disabled={!code.trim() || redeemed}
          className="btn-primary w-full h-[54px] text-[17px] font-semibold disabled:opacity-60"
        >
          {redeemed ? 'Applying...' : 'Redeem Code'}
        </button>

        <button 
          onClick={() => alert('View supported gift codes & issues (demo)')}
          className="w-full text-center mt-4 text-sm underline"
          style={{ color: '#4c5df9' }}
        >
          View Supported issues
        </button>
      </div>
    </div>
  )
}
