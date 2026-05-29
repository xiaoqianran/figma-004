import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBooking, RideOption, Location } from '../context/BookingContext'

// Existing improved screens
import { SplashScreen } from '../screens/SplashScreen'
import { SignInScreen } from '../screens/SignInScreen'
import { DestinationScreen } from '../screens/DestinationScreen'
import { CarResultScreen } from '../screens/CarResultScreen'
import { AddCardScreen } from '../screens/AddCardScreen'
import { BookingConfirmScreen } from '../screens/BookingConfirmScreen'
import { RideTrackingScreen } from '../screens/RidesTrackingScreen'

// New screens
import { HomeScreen } from '../screens/HomeScreen'
import { MessagesScreen } from '../screens/MessagesScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { BottomNavBar, NavTab } from './BottomNavBar'

// Main views for the integrated experience
type AppView = 
  | 'splash'
  | 'signin-welcome' 
  | 'signin-create'
  | 'home'
  | 'destination'
  | 'car-results'
  | 'booking-confirm'
  | 'add-payment'
  | 'ride-tracking'

interface RideshareAppProps {
  initialView?: AppView
}

export function RideshareApp({ initialView = 'splash' }: RideshareAppProps) {
  const [currentView, setCurrentView] = useState<AppView>(initialView)
  const [navTab, setNavTab] = useState<NavTab>('home')
  const [, setPendingDestination] = useState<Location | null>(null)

  const { 
    state, 
    login, 
    setDestination, 
    selectRide, 
    startLoading, 
    stopLoading, 
    confirmBooking, 
    findRides, 
    resetBooking 
  } = useBooking()

  const isAuthenticated = state.isAuthenticated
  const hasActiveRide = !!state.activeRide

  // Simple navigation stack for back buttons (keeps flow natural)
  const [viewHistory, setViewHistory] = useState<AppView[]>([])

  const navigateTo = (view: AppView) => {
    setViewHistory(prev => [...prev, currentView])
    setCurrentView(view)
  }

  const goBack = () => {
    if (viewHistory.length > 0) {
      const prev = viewHistory[viewHistory.length - 1]
      setViewHistory(prev => prev.slice(0, -1))
      setCurrentView(prev)
    } else {
      // Sensible fallbacks
      if (['destination', 'car-results', 'booking-confirm', 'add-payment'].includes(currentView)) {
        setCurrentView('home')
        setNavTab('home')
      } else if (['signin-welcome', 'signin-create'].includes(currentView)) {
        setCurrentView('splash')
      } else {
        setCurrentView('home')
        setNavTab('home')
      }
    }
  }

  // Fake auth success handler
  const handleAuthSuccess = (name: string, email: string) => {
    login(name, email)
    // Small delay for "logging in" feel
    startLoading('Signing you in...')
    setTimeout(() => {
      stopLoading()
      setViewHistory([])
      setCurrentView('home')
      setNavTab('home')
    }, 520)
  }

  // Destination flow
  const handleOpenDestination = () => {
    setPendingDestination(null)
    navigateTo('destination')
  }

  const handleDestinationConfirmed = async (loc: Location) => {
    setDestination(loc)
    setPendingDestination(loc)

    // Transition to finding rides
    navigateTo('car-results')

    // Trigger the fake findRides API (shows loading inside context)
    try {
      await findRides(loc)
    } catch {
      // ignore for demo
    }
  }

  // Ride selection flow
  const handleRideSelected = (ride: RideOption) => {
    selectRide(ride)
  }

  const handleRideConfirmed = () => {
    navigateTo('booking-confirm')
  }

  // Booking confirmation -> payment or direct
  const handleBookingConfirm = async () => {
    if (!state.paymentMethod) {
      navigateTo('add-payment')
      return
    }

    startLoading('Confirming your booking...')
    await new Promise(r => setTimeout(r, 780))
    stopLoading()

    confirmBooking()
    navigateTo('ride-tracking')
  }

  const handleAddPaymentFromConfirm = () => {
    navigateTo('add-payment')
  }

  // After adding payment in flow
  const handlePaymentAdded = () => {
    // go back to confirm or straight to processing
    if (currentView === 'add-payment') {
      // Simulate payment success
      startLoading('Verifying card...')
      setTimeout(async () => {
        stopLoading()
        // Now confirm the booking
        confirmBooking()
        setCurrentView('ride-tracking')
      }, 680)
    }
  }

  // From tracking back to home (ride ended)
  const handleRideComplete = () => {
    resetBooking()
    setCurrentView('home')
    setNavTab('home')
    setViewHistory([])
  }

  // Bottom nav handler (only meaningful on main screens)
  const handleTabChange = (tab: NavTab) => {
    setNavTab(tab)

    if (tab === 'home') {
      setCurrentView('home')
    } else if (tab === 'search') {
      // Search tab = open destination flow
      handleOpenDestination()
    } else if (tab === 'messages') {
      setCurrentView('home') // we render messages as overlay or just switch
      // For simplicity we stay on home but could push messages view. Here we show it inline below
    } else if (tab === 'profile') {
      setCurrentView('home')
    }
  }

  // Loading overlay (inlined to avoid defining component inside render)

  // Render current main content view inside the phone
  const renderMainContent = () => {
    // Auth flow (pre-bottom nav)
    if (!isAuthenticated || currentView === 'splash') {
      if (currentView === 'splash') {
        return (
          <SplashScreen 
            variant="dark" 
            onCreateAccount={() => setCurrentView('signin-create')} 
            onLogin={() => setCurrentView('signin-welcome')} 
          />
        )
      }
      if (currentView === 'signin-welcome') {
        return (
          <SignInScreen 
            variant="welcome" 
            onBack={goBack} 
            onLoginSuccess={handleAuthSuccess}
            onLogin={() => {}} 
            onSignUp={() => setCurrentView('signin-create')} 
          />
        )
      }
      if (currentView === 'signin-create') {
        return (
          <SignInScreen 
            variant="create" 
            onBack={goBack} 
            onLoginSuccess={handleAuthSuccess}
            onLogin={() => {}} 
            onSignUp={() => setCurrentView('signin-welcome')} 
          />
        )
      }
    }

    // Main authenticated experience
    if (currentView === 'home') {
      const showMessages = navTab === 'messages'
      const showProfile = navTab === 'profile'

      return (
        <div className="relative h-full flex flex-col">
          <HomeScreen 
            onSearchDestination={handleOpenDestination}
            onQuickDestination={(loc: { label?: string; sub?: string; address?: string } | string) => handleDestinationConfirmed({ address: (typeof loc === 'string' ? loc : (loc?.label || loc?.address || 'Selected Place')), subtitle: (typeof loc === 'object' && loc ? loc.sub : undefined) })}
            onViewActiveRide={() => setCurrentView('ride-tracking')}
          />

          {/* Overlay tabs content */}
          <AnimatePresence>
            {showMessages && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#f8fafc] z-40"
              >
                <MessagesScreen onBack={() => { setNavTab('home'); setCurrentView('home') }} />
              </motion.div>
            )}
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#f8fafc] z-40"
              >
                <ProfileScreen 
                  onBack={() => { setNavTab('home'); setCurrentView('home') }} 
                  onManagePayments={() => navigateTo('add-payment')}
                  onLogout={() => {
                    setCurrentView('splash')
                    setNavTab('home')
                    setViewHistory([])
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <BottomNavBar 
            activeTab={navTab} 
            onTabChange={handleTabChange} 
            hasActiveRide={hasActiveRide} 
          />
        </div>
      )
    }

    if (currentView === 'destination') {
      return (
        <DestinationScreen 
          onBack={goBack} 
          onConfirmDestination={handleDestinationConfirmed} 
        />
      )
    }

    if (currentView === 'car-results') {
      return (
        <CarResultScreen 
          onBack={goBack} 
          onSelectRide={handleRideSelected} 
          onConfirmRide={handleRideConfirmed} 
        />
      )
    }

    if (currentView === 'booking-confirm') {
      return (
        <BookingConfirmScreen 
          onBack={goBack} 
          onConfirm={handleBookingConfirm}
          onAddPayment={handleAddPaymentFromConfirm}
        />
      )
    }

    if (currentView === 'add-payment') {
      return (
        <AddCardScreen 
          variant="light" 
          onBack={goBack} 
          onAddCardSuccess={handlePaymentAdded}
        />
      )
    }

    if (currentView === 'ride-tracking') {
      return (
        <RideTrackingScreen 
          onBack={() => { 
            // Going back from tracking goes to home
            setCurrentView('home') 
            setNavTab('home')
          }} 
          onComplete={handleRideComplete} 
        />
      )
    }

    // Fallback
    return <HomeScreen onSearchDestination={handleOpenDestination} />
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView + (isAuthenticated ? '-auth' : '')}
          initial={{ opacity: 0.96, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.96, y: -4 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          {renderMainContent()}
        </motion.div>
      </AnimatePresence>

      {/* Loading overlay (global for booking/payment flows) */}
      {state.isLoading && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="inline-block w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
            <div className="text-sm tracking-wide font-medium">{state.loadingMessage || 'Please wait...'}</div>
          </div>
        </div>
      )}

      {/* Subtle top safe area for notch simulation already handled in phone frame */}
    </div>
  )
}
