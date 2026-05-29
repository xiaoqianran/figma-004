import { useState } from 'react'
import { motion } from 'framer-motion'

import { StatusBar } from '../components/ui/StatusBar'
import { TopBar } from '../components/ui/TopBar'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

interface SignInScreenProps {
  onBack?: () => void
  onLogin?: () => void
  onLoginSuccess?: (name: string, email: string) => void
  onSignUp?: () => void
  variant?: 'welcome' | 'create'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function SignInScreen({ 
  onBack, 
  onLogin, 
  onLoginSuccess,
  onSignUp, 
  variant = 'welcome',
  showToast
}: SignInScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const isCreate = variant === 'create'

  // Realistic form validation + error states
  const validate = () => {
    const newErrors: typeof errors = {}
    const emailTrim = email.trim()

    if (!emailTrim) {
      newErrors.email = isCreate ? 'Please enter your full name or email' : 'Email or phone is required'
    } else if (!isCreate && !emailTrim.includes('@') && !/^\+?\d{7,}$/.test(emailTrim)) {
      newErrors.email = 'Enter a valid email or phone number'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // For create variant also validate the dummy fields if present (they exist in JSX)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      showToast?.('Please fix the errors above', 'error')
      return
    }

    setIsLoading(true)

    // Simulate network + haptic timing
    await new Promise(r => setTimeout(r, 780))

    setIsLoading(false)

    // Support both gallery simple onLogin and full flow onLoginSuccess
    const name = isCreate ? (email || 'Alex Rivera') : 'Alex Rivera'
    const emailVal = email.includes('@') ? email : 'alex@meteor.app'
    onLoginSuccess?.(name, emailVal)
    onLogin?.()
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Status bar + TopBar using design system (replaces duplicated header code) */}
      <StatusBar variant="light" />
      <TopBar onBack={onBack} variant="light" />

      {/* Illustration */}
      <div className="flex justify-center pt-6 pb-8">
        <div className="relative w-[175px] h-[175px]">
          {/* Soft background glow */}
          <div className="absolute inset-0 bg-[#ffeef2] rounded-full blur-2xl" />
          
          {/* Shield illustration (simplified but close) */}
          <div className="relative w-[120px] h-[140px] mx-auto">
            <div className="absolute inset-0 bg-[#f8b4c4] rounded-[40px] rotate-[-8deg]" />
            <div className="absolute inset-[8px] bg-[#5dd4f5] rounded-[32px] flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner">
                <div className="text-[#5dd4f5] text-3xl font-bold">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#1c1f2a]">
            {isCreate ? 'Create Your Account' : 'Welcome'}
          </h1>
          <p className="mt-2 text-[#6b7280] text-[15px]">
            {isCreate 
              ? 'Please fill in a few details below' 
              : 'Please fill in a few details below'}
          </p>
        </div>

        {/* Form - now using design system Input for consistency + error support */}
        <div className="space-y-4">
          <Input
            type="text"
            placeholder={isCreate ? "Full name" : "Email or Phone number"}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: undefined}) }}
            error={errors.email}
            inputClassName="h-[58px] text-[17px]"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: undefined}) }}
            error={errors.password}
            inputClassName="h-[58px] text-[17px]"
          />

          {isCreate && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="MM / YY"
                inputClassName="h-[58px] text-[17px]"
              />
              <Input
                type="text"
                placeholder="CVV"
                inputClassName="h-[58px] text-[17px]"
              />
            </div>
          )}

          {!isCreate && (
            <div className="text-right">
              <button className="text-sm text-[#4c586a] active:text-[#4c5df9]">
                Forget password?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions - using design system Button */}
      <div className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <motion.div whileTap={{ scale: isLoading ? 1 : 0.975 }}>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            fullWidth
            className="h-14 text-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="spinner" /> {isCreate ? 'Creating...' : 'Signing in...'}
              </>
            ) : (
              isCreate ? 'Create Account' : 'Log in'
            )}
          </Button>
        </motion.div>

        <div className="mt-5 text-center text-sm text-[#6b7280]">
          {isCreate ? (
            <>Already have an account? <span onClick={onSignUp} className="text-[#4c5df9] font-medium cursor-pointer">Log in</span></>
          ) : (
            <>Or sign in with</>
          )}
        </div>

        {!isCreate && (
          <div className="flex justify-center gap-4 mt-4">
            <button className="w-12 h-12 rounded-full border flex items-center justify-center active:bg-gray-50">
              <span className="text-[#ea4335] font-bold text-xl">G</span>
            </button>
            <button className="w-12 h-12 rounded-full border flex items-center justify-center active:bg-gray-50">
              <span className="text-[#1877f2] font-bold text-xl">f</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
