

import { motion } from 'framer-motion'
import { StatusBar } from '../components/ui/StatusBar'
import { Button } from '../components/ui/Button'

interface SplashScreenProps {
  onCreateAccount?: () => void
  onLogin?: () => void
  variant?: 'dark' | 'light'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function SplashScreen({ 
  onCreateAccount, 
  onLogin, 
  variant = 'dark' 
}: SplashScreenProps) {
  const isDark = variant === 'dark'

  return (
    <div 
      className="screen flex flex-col items-center justify-between px-6 pb-12 pt-0"
      style={{ 
        backgroundColor: isDark ? '#121826' : '#f8fafc',
        color: isDark ? '#fff' : '#1c1f2a'
      }}
    >
      {/* Shared StatusBar component (removes duplication across screens) */}
      <StatusBar variant={isDark ? 'dark' : 'light'} />

      {/* Main content - centered logo */}
      <div className="flex flex-col items-center justify-center flex-1 -mt-12">
        {/* Meteor Logo - stylized */}
        <div className="relative mb-2">
          {/* Gradient lines above logo */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[220px] flex flex-col gap-1.5">
            <div className="h-[3px] w-3/4 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent" />
            <div className="h-[3px] w-2/3 mx-auto rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-transparent" />
            <div className="h-[3px] w-1/2 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-transparent" />
          </div>

          {/* Meteor wordmark */}
          <div className="relative">
            <h1 
              className="font-poppins text-[52px] font-semibold tracking-[-2.5px] select-none"
              style={{ 
                color: isDark ? '#ffffff' : '#1c1f2a',
                WebkitTextStroke: isDark ? '1.5px #ffffff' : '1px #1c1f2a',
                paintOrder: 'stroke fill'
              }}
            >
              meteor
            </h1>
            {/* Small dot accent */}
            <div className="absolute top-[22px] right-[-2px] w-3 h-3 rounded-full bg-[#4c5df9]" />
          </div>
        </div>
      </div>

      {/* Bottom actions - using design system Button */}
      <div className="w-full max-w-[327px] space-y-4">
        <motion.div
          whileTap={{ scale: 0.975 }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
        >
          <Button onClick={onCreateAccount} fullWidth>
            Create New Account
          </Button>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.975 }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
        >
          <Button
            variant="ghost"
            fullWidth
            onClick={onLogin}
            className="h-[56px] text-[17px]"
          >
            Log In
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
