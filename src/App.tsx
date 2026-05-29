import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneFrame, type ToastItem } from './components/PhoneFrame'
import { SplashScreen } from './screens/SplashScreen'
import { SignInScreen } from './screens/SignInScreen'
import { AddCardScreen } from './screens/AddCardScreen'
import { CardScanScreen } from './screens/CardScanScreen'
import { DestinationScreen } from './screens/DestinationScreen'
import { CarResultScreen } from './screens/CarResultScreen'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsPage } from './screens/SettingsPage'
import { RatingAndTipsPage } from './screens/RatingAndTipsPage'
import { MessagesPage } from './screens/MessagesPage'
import { GiftCodePage } from './screens/GiftCodePage'
import { CarResultV2Screen } from './screens/CarResultV2Screen'
import { RideshareApp } from './components/RideshareApp'
import { BookingProvider } from './context/BookingContext'
// Design System UI kit now powers most screens (Button, Input, Card, StatusBar, TopBar, RideCard, CreditCard...)
import './theme' // side-effect import for any consumers if needed

type ScreenKey = 
  | 'splash-dark' 
  | 'splash-light'
  | 'signin-welcome'
  | 'signin-create'
  | 'add-card-dark'
  | 'add-card-light'
  | 'card-scan-dark'
  | 'destination'
  | 'car-result'
  | 'settings-dark'
  | 'settings-light'
  | 'rating-tips'
  | 'messages'
  | 'gift-code'
  | 'home'
  | 'car-result-v2'

const screens: { key: ScreenKey; label: string; group: string }[] = [
  { key: 'splash-dark', label: 'Splash (Dark)', group: 'Onboarding' },
  { key: 'splash-light', label: 'Splash (Light)', group: 'Onboarding' },
  { key: 'signin-welcome', label: 'Sign In', group: 'Auth' },
  { key: 'signin-create', label: 'Create Account', group: 'Auth' },
  { key: 'add-card-dark', label: 'Add Card (Dark)', group: 'Payment' },
  { key: 'add-card-light', label: 'Add Card (Light)', group: 'Payment' },
  { key: 'card-scan-dark', label: 'Card Scan', group: 'Payment' },
  { key: 'destination', label: 'Destination', group: 'Booking' },
  { key: 'car-result', label: 'Car Results', group: 'Booking' },

  { key: 'home', label: 'Home / Map', group: 'Core App' },
  { key: 'settings-dark', label: 'Settings (Dark)', group: 'Core App' },
  { key: 'settings-light', label: 'Settings (Light)', group: 'Core App' },
  { key: 'rating-tips', label: 'Rating & Tips (Keypad)', group: 'Core App' },
  { key: 'messages', label: 'Messages (List + Chat)', group: 'Core App' },
  { key: 'gift-code', label: 'Gift Code', group: 'Core App' },
  { key: 'car-result-v2', label: 'Car Results V2', group: 'Booking' },
]

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('splash-dark')
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null)

  // Gallery (stable, all beautiful screens) vs Full-Flow (experimental - one agent hit a loop during development)
  const [demoMode, setDemoMode] = useState<'gallery' | 'full-flow'>('gallery')

  // Premium toast system with spring animation (feels alive)
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now() + Math.random()
    const newToast: ToastItem = { id, message, type }
    setToasts(prev => [...prev.slice(-2), newToast]) // cap at 3

    // Auto-dismiss with nice timing (subtle haptic-like feel)
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2650)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Realistic "Finding drivers" flow - called from Destination
  const startFindingDrivers = useCallback((destination: string) => {
    setOverlay(
      <div className="w-full h-full bg-[#0a0c12]/95 backdrop-blur-xl flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#4c5df9]/10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              className="w-9 h-9 border-[3px] border-[#4c5df9] border-t-transparent rounded-full"
            />
          </div>
          <div className="text-white text-[22px] font-semibold tracking-[-0.4px] mb-1.5">Finding drivers...</div>
          <div className="text-white/60 text-[15px]">Near {destination}</div>
        </div>

        {/* Pulsing location dots for realism */}
        <div className="flex gap-2.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/70"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="mt-9 text-[12px] text-white/40 tracking-[0.5px]">This usually takes a few seconds</div>
      </div>
    )

    // Realistic delay + success transition
    window.setTimeout(() => {
      setOverlay(null)
      setCurrentScreen('car-result')
      showToast(`3 drivers found near ${destination}`, 'success')
    }, 2350)
  }, [showToast])

  // Payment / booking processing flow with progress (used by CarResult + AddCard)
  const startPaymentProcessing = useCallback((label: string = 'Ride') => {
    let progress = 0
    const stages = [
      'Authorizing payment...',
      'Confirming with driver...',
      'Securing your ride...'
    ]
    let stageIndex = 0

    setOverlay(
      <div className="w-full h-full bg-black/90 flex flex-col items-center justify-center px-7 text-white">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold mb-1">{label} confirmed</div>
          <div className="text-white/50 text-sm">Processing securely</div>
        </div>

        {/* Animated progress */}
        <div className="w-full max-w-[260px] bg-white/10 rounded-full h-[5px] overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: '8%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <motion.div 
          key={stageIndex}
          className="text-sm text-white/70 h-5"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
        >
          {stages[stageIndex]}
        </motion.div>
      </div>
    )

    const interval = window.setInterval(() => {
      progress += 100 / 21 // ~2s
      stageIndex = Math.min(Math.floor(progress / 33), stages.length - 1)
    }, 95)

    window.setTimeout(() => {
      clearInterval(interval)
      setOverlay(null)
      showToast('Ride booked! Driver arriving in ~3 min', 'success')
      // After success, optionally return to destination or stay on car result
      // For polish, stay on results with updated state but keep simple
    }, 2150)
  }, [showToast])

  const renderScreen = () => {
    const commonToast = { showToast }
    switch (currentScreen) {
      case 'splash-dark':
        return <SplashScreen variant="dark" onCreateAccount={() => setCurrentScreen('signin-create')} onLogin={() => setCurrentScreen('signin-welcome')} {...commonToast} />
      case 'splash-light':
        return <SplashScreen variant="light" onCreateAccount={() => setCurrentScreen('signin-create')} onLogin={() => setCurrentScreen('signin-welcome')} {...commonToast} />
      
      case 'signin-welcome':
        return (
          <SignInScreen 
            variant="welcome" 
            onBack={() => setCurrentScreen('splash-dark')} 
            onLogin={() => {
              // Enhanced: real validation happens inside screen now, this is post-success
              showToast('Welcome back! Loading your rides...')
              setTimeout(() => setCurrentScreen('destination'), 620)
            }} 
            onSignUp={() => setCurrentScreen('signin-create')} 
            {...commonToast}
          />
        )
      case 'signin-create':
        return (
          <SignInScreen 
            variant="create" 
            onBack={() => setCurrentScreen('splash-dark')} 
            onLogin={() => {
              showToast('Account created successfully')
              setTimeout(() => setCurrentScreen('destination'), 620)
            }} 
            onSignUp={() => setCurrentScreen('signin-welcome')} 
            {...commonToast}
          />
        )
      
      case 'add-card-dark':
        return <AddCardScreen variant="dark" onBack={() => setCurrentScreen('splash-dark')} onAddCardSuccess={() => startPaymentProcessing('Card')} />
      case 'add-card-light':
        return <AddCardScreen variant="light" onBack={() => setCurrentScreen('splash-dark')} onAddCardSuccess={() => startPaymentProcessing('Card')} />
      
      case 'card-scan-dark':
        return <CardScanScreen variant="dark" onBack={() => setCurrentScreen('splash-dark')} />
      
      case 'destination':
        return <DestinationScreen onBack={() => setCurrentScreen('splash-dark')} onSelectPlace={startFindingDrivers} />
      
      case 'car-result':
        return <CarResultScreen onBack={() => setCurrentScreen('destination')} onConfirmRide={startPaymentProcessing} />

      // Expanded high-fidelity screens (implemented via Screen Expansion task)
      case 'home':
        return <HomeScreen onBookRide={() => setCurrentScreen('destination')} />
      
      case 'settings-dark':
        return <SettingsPage variant="dark" onBack={() => setCurrentScreen('home')} />
      case 'settings-light':
        return <SettingsPage variant="light" onBack={() => setCurrentScreen('home')} />
      
      case 'rating-tips':
        return <RatingAndTipsPage variant="dark" onBack={() => setCurrentScreen('home')} />
      
      case 'messages':
        return <MessagesPage variant="dark" onBack={() => setCurrentScreen('home')} />
      
      case 'gift-code':
        return <GiftCodePage variant="dark" onBack={() => setCurrentScreen('home')} />
      
      case 'car-result-v2':
        return <CarResultV2Screen onBack={() => setCurrentScreen('home')} />
      
      default:
        return <SplashScreen variant="dark" {...commonToast} />
    }
  }

  const currentIsDark = currentScreen.includes('dark') || currentScreen === 'splash-dark'

  const isFullFlow = demoMode === 'full-flow'

  return (
    <BookingProvider>
      <div className="min-h-screen bg-[#0f1117] text-white flex">
      {/* Sidebar Gallery + Flow Controls */}
      <div className="w-72 border-r border-white/10 bg-[#0a0c12] p-6 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c5df9] flex items-center justify-center text-xl">M</div>
            <div>
              <div className="font-semibold tracking-tight">Rideshare UI Kit</div>
              <div className="text-[10px] text-white/40 -mt-0.5">Figma → Code Replica</div>
            </div>
          </div>
        </div>

        {/* NEW: Full Flow Demo Toggle - high priority deliverable */}
        <div className="mb-5 px-1">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">EXPERIENCE</div>
          <button
            onClick={() => setDemoMode(isFullFlow ? 'gallery' : 'full-flow')}
            className={`w-full rounded-2xl px-4 py-3 text-left font-medium text-sm transition border ${isFullFlow ? 'bg-[#4c5df9] text-white border-[#4c5df9]' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
          >
            {isFullFlow ? '✓  Full App Flow (with Bottom Nav + State)' : 'Switch to Full App Flow Demo'}
          </button>
          <div className="text-[10px] text-white/40 mt-1.5 leading-tight px-0.5">
            {isFullFlow 
              ? 'Complete journey: Splash → Auth → Home + Bottom Nav → Destination → Results → Payment → Success + Tracking'
              : 'Isolated high-fidelity screen previews'}
          </div>
        </div>

        {demoMode === 'gallery' && (
          <>
            <div className="text-xs uppercase tracking-[1px] text-white/40 mb-3 px-2">Screens</div>

            {Object.entries(
              screens.reduce((acc, s) => {
                (acc[s.group] = acc[s.group] || []).push(s)
                return acc
              }, {} as Record<string, typeof screens>)
            ).map(([group, items]) => (
              <div key={group} className="mb-6">
                <div className="text-[10px] font-medium text-white/40 px-2 mb-1.5">{group}</div>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setCurrentScreen(item.key)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        currentScreen === item.key 
                          ? 'bg-white/10 text-white font-medium' 
                          : 'hover:bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-white/40 px-2 leading-relaxed">
              Replicated from Figma<br />
              using MCP tools • High fidelity
            </div>
          </>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-10 bg-[#0a0c12]">
        <div>
          {/* Device label */}
          <div className="flex justify-between items-center mb-3 px-1">
            <div>
              <span className="text-sm text-white/70">iPhone 14 Pro</span>
              <span className="ml-2 text-[10px] px-1.5 py-px rounded bg-white/10 text-white/50">375 × 812</span>
            </div>
            <div className="text-xs text-white/50">
              {isFullFlow ? 'FULL APP FLOW' : currentScreen.replace(/-/g, ' ')}
            </div>
          </div>

          <PhoneFrame 
            isDark={isFullFlow ? false : currentIsDark} 
            overlay={isFullFlow ? undefined : overlay} 
            toasts={isFullFlow ? [] : toasts} 
            onDismissToast={isFullFlow ? undefined : dismissToast}
          >
            {isFullFlow ? (
              <RideshareApp />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  className="w-full h-full"
                  initial={{ opacity: 0, x: 26, scale: 0.982 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -16, scale: 0.988 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 340, 
                    damping: 32, 
                    mass: 0.9 
                  }}
                >
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>
            )}
          </PhoneFrame>

          <div className="text-center mt-4 text-xs text-white/40">
            {isFullFlow 
              ? 'Realistic multi-step journey with global state, loading delays & persistent bottom navigation'
              : 'Click buttons inside the phone or choose screens from the left'}
          </div>

          {isFullFlow && (
            <div className="text-center mt-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Experimental — Flow agent encountered a repetitive edit loop and was cancelled. Gallery mode has all new screens.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
    </BookingProvider>
  )
}
