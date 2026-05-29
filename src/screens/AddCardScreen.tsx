
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { TopBar } from '../components/ui/TopBar'
import { CreditCard } from '../components/ui/CreditCard'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

interface AddCardScreenProps {
  onBack?: () => void
  onAddCardSuccess?: () => void
  variant?: 'dark' | 'light'
  showToast?: (message: string) => void
}

export function AddCardScreen({ onBack, onAddCardSuccess, variant = 'dark' }: AddCardScreenProps) {
  const isDark = variant === 'dark'
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('Mastercard')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')

  const bgColor = isDark ? '#121826' : '#f8fafc'
  const textColor = isDark ? '#fff' : '#1c1f2a'
  const inputBg = isDark ? '#1e293b' : '#f1f3f5'

  const handleAddCard = async () => {
    setError('')
    // Basic realistic validation
    if (!expiry.match(/^\d{2}\s*\/\s*\d{2}$/)) {
      setError('Enter expiry as MM / YY')
      return
    }
    if (!cvv.match(/^\d{3,4}$/)) {
      setError('CVV must be 3 or 4 digits')
      return
    }

    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 920)) // simulate processing + haptic delay
    setIsProcessing(false)
    onAddCardSuccess?.()
  }

  return (
    <div 
      className="screen flex flex-col"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* StatusBar + TopBar (design system) */}
      <StatusBar variant={isDark ? 'dark' : 'light'} />
      <TopBar 
        onBack={onBack} 
        variant={isDark ? 'dark' : 'light'} 
        title="Add Payment method" 
      />

      {/* Credit Card Visual - now using shared CreditCard component */}
      <div className="px-6 pb-8">
        <CreditCard
          variant={isDark ? 'dark' : 'light'}
          cardNumber="4523 •••• •••• 9526"
          balance="$1500"
          expiry="05/23"
        />
      </div>

      {/* Form - using Input components + design system styles */}
      <div className="flex-1 px-6 space-y-3 pb-6">
        {/* Card number (kept custom for icon + visual fidelity) */}
        <div 
          className="flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ backgroundColor: inputBg }}
        >
          <div className="text-[#4c5df9]">
            <svg width="22" height="18" viewBox="0 0 24 18" fill="none">
              <rect x="1" y="2" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <rect x="4" y="7" width="6" height="1.5" fill="currentColor"/>
            </svg>
          </div>
          <input 
            type="text" 
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="flex-1 bg-transparent text-[17px] font-medium outline-none" 
            style={{ color: textColor }}
          />
          <Camera size={20} className="text-[#4c5df9]" />
        </div>

        {/* Expiry + CVV - using Input for consistency */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Exp date"
            placeholder="05 / 23"
            value={expiry}
            onChange={(e) => { setExpiry(e.target.value); setError('') }}
            inputClassName="text-lg bg-transparent px-0"
            containerClassName="rounded-2xl px-5 py-1"
            style={{ backgroundColor: inputBg }}
          />
          <Input
            label="CVV"
            placeholder="123"
            value={cvv}
            onChange={(e) => { setCvv(e.target.value); setError('') }}
            inputClassName="text-lg bg-transparent px-0"
            containerClassName="rounded-2xl px-5 py-1"
            style={{ backgroundColor: inputBg }}
          />
        </div>

        {/* Country selector (kept for visual) */}
        <div 
          className="flex items-center justify-between rounded-2xl px-5 py-[17px]"
          style={{ backgroundColor: inputBg }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-5 bg-[#4c5df9] rounded-sm" />
            <span>United States</span>
          </div>
          <div className="text-xl opacity-40">⌄</div>
        </div>
      </div>

      {/* Bottom Button - using Button */}
      <div className="p-6 pt-2 bg-inherit">
        {error && <div className="text-[#fe5050] mb-2 text-center text-sm">{error}</div>}
        <motion.div whileTap={{ scale: isProcessing ? 1 : 0.97 }}>
          <Button
            onClick={handleAddCard}
            disabled={isProcessing}
            fullWidth
            className="h-[54px] text-[17px]"
          >
            {isProcessing ? (
              <> <div className="spinner" /> Adding card... </>
            ) : (
              'Add card'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
