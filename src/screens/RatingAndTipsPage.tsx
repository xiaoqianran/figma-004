import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

interface RatingAndTipsPageProps {
  onBack?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del']
]

export function RatingAndTipsPage({ onBack, variant = 'dark' }: RatingAndTipsPageProps) {
  const isDark = variant === 'dark'

  const bg = isDark ? '#121826' : '#f8fafc'
  const panelBg = isDark ? '#10141e' : '#ffffff'
  const keyBg = isDark ? '#1e293b' : '#f1f5f9'
  const textColor = isDark ? '#f8fafc' : '#1c1f2a'
  const muted = isDark ? '#c5c7d0' : '#6b7280'

  const [tipAmount, setTipAmount] = useState('5.53')
  const [rating, setRating] = useState(4)

  const handleKey = (key: string) => {
    if (key === 'del') {
      setTipAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
      return
    }
    if (key === '.') {
      if (!tipAmount.includes('.')) {
        setTipAmount(prev => prev + '.')
      }
      return
    }
    // numeric
    setTipAmount(prev => {
      if (prev === '0') return key
      const next = prev + key
      // limit length
      if (next.length > 6) return prev
      return next
    })
  }

  const formattedTip = tipAmount.startsWith('$') ? tipAmount : `$${tipAmount}`

  return (
    <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
      {/* Status bar */}
      <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Header */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl border flex items-center justify-center active:opacity-70"
          style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}
        >
          <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#1c1f2a'} />
        </button>
        <div>
          <div className="text-[18px] font-semibold" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Tips</div>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 pt-2">
        <div className="text-center mb-6">
          <p className="text-[15px] leading-snug" style={{ color: muted }}>
            Rate your ride with Jafar and add tips if you want.
          </p>
        </div>

        {/* Rating Stars */}
        <div className="flex justify-center gap-3 mb-8">
          {[1,2,3,4,5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className="text-4xl transition-transform active:scale-90"
            >
              <span style={{ color: star <= rating ? '#ff712f' : (isDark ? '#334155' : '#d1d5db') }}>★</span>
            </button>
          ))}
        </div>

        {/* Tip Input */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-1.5 px-1" style={{ color: muted }}>TIP AMOUNT</div>
          <div 
            className="rounded-2xl px-6 py-4 text-center"
            style={{ backgroundColor: keyBg }}
          >
            <div className="font-mono text-[42px] font-semibold tracking-[-1px] tabular-nums" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>
              {formattedTip}
            </div>
            <div className="h-px bg-[#121826] opacity-20 my-2 mx-12" />
          </div>
        </div>
      </div>

      {/* Numeric Keypad - large and prominent */}
      <div className="mt-auto px-2 pb-2" style={{ backgroundColor: panelBg }}>
        <div className="grid grid-cols-3 gap-2 p-2">
          {KEYPAD.flat().map((key, idx) => {
            const isDelete = key === 'del'
            const label = isDelete ? '⌫' : key
            return (
              <button
                key={idx}
                onClick={() => handleKey(key)}
                className="h-[52px] rounded-xl text-[22px] font-medium active:bg-[#4c5df9] active:text-white flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: key === '.' ? (isDark ? '#1e293b' : '#e5e7eb') : keyBg,
                  color: textColor,
                  fontFamily: 'Rubik, system-ui, sans-serif',
                  letterSpacing: key.length === 1 ? '1px' : '0'
                }}
              >
                {label}
                {key === '0' && <span className="absolute text-[10px] mt-8 text-[#9fa1b0]"> </span>}
              </button>
            )
          })}
        </div>

        {/* Bottom action */}
        <div className="px-4 pt-3 pb-7">
          <button 
            onClick={() => alert(`Rated ${rating}★ with tip ${formattedTip} (demo)`)}
            className="btn-primary w-full h-[54px] text-[17px] font-semibold"
          >
            Confirm &amp; Send Tip
          </button>
          <button 
            onClick={() => alert('Enter card manually (demo)')}
            className="w-full text-center text-[15px] font-semibold py-3 mt-1"
            style={{ color: isDark ? '#f8fafc' : '#4c5df9' }}
          >
            Enter Card Manually?
          </button>
        </div>
      </div>
    </div>
  )
}
