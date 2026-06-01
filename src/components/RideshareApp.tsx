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
import { RideTrackingScreen } from '../screens/RideTrackingScreen'

// New screens
import { HomeScreen } from '../screens/HomeScreen'
import { MessagesScreen } from '../screens/MessagesScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { SettingsPage } from '../screens/SettingsPage'
import { RatingAndTipsPage } from '../screens/RatingAndTipsPage'
import { RideHistoryScreen } from '../screens/RideHistoryScreen'
import { GiftCodePage } from '../screens/GiftCodePage'
import { NotificationsScreen } from '../screens/NotificationsScreen'
import { WalletScreen } from '../screens/WalletScreen'
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
  | 'rating'
  | 'history'
  | 'gift'
  | 'notifications'
  | 'wallet'

interface RideshareAppProps {
  initialView?: AppView
}

export function RideshareApp({ initialView = 'splash' }: RideshareAppProps) {
  const [currentView, setCurrentView] = useState<AppView>(initialView)
  const [navTab, setNavTab] = useState<NavTab>('home')
  const [, setPendingDestination] = useState<Location | null>(null)
  const [profileView, setProfileView] = useState<'main' | 'settings'>('main')
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  // Local toast fn defined early so all later handlers can reference safely
  const showToastInApp = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAppToast({ message, type })
    setTimeout(() => setAppToast(null), 2650)
  }

  const { 
    state, 
    login, 
    setDestination, 
    selectRide, 
    startLoading, 
    stopLoading, 
    confirmBooking, 
    findRides, 
    updateRideStatus,
    completeRide,
    resetBooking,
    submitRating,
    rebookRide,
    addGiftBalance,
    addActivity,
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
    setShowNotifications(false)
    if (viewHistory.length > 0) {
      const prev = viewHistory[viewHistory.length - 1]
      setViewHistory(prev => prev.slice(0, -1))
      setCurrentView(prev)
    } else {
      // Sensible fallbacks
      if (['destination', 'car-results', 'booking-confirm', 'add-payment', 'rating', 'history', 'gift', 'notifications', 'wallet'].includes(currentView)) {
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
      setShowNotifications(false)
      setProfileView('main')
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

  // After adding payment in flow (AddCardScreen now sets the method via context)
  const handlePaymentAdded = () => {
    stopLoading()
    // Log to Activity feed (makes the new Notifications screen feel connected and real)
    addActivity?.({ 
      type: 'payment_added', 
      title: 'Payment method added', 
      description: 'New card saved and set as default. Ready for instant bookings.' 
    })

    if (currentView === 'add-payment') {
      // If user came from Profile > Payments, return to profile overlay (keep navTab)
      if (navTab === 'profile') {
        setCurrentView('home')
        setProfileView('main')
      } else {
        // Booking flow: go back to confirm to see updated payment
        setCurrentView('booking-confirm')
      }
    }
  }

  // Full flow: after ride arrives/completes in tracking -> show rating
  const handleShowRating = () => {
    // Ensure status is completed but KEEP activeRide for RatingAndTipsPage to read
    if (state.activeRide && state.activeRide.status !== 'completed') {
      updateRideStatus('completed')
    }
    navigateTo('rating')
  }

  // Final reset after rating submitted (or cancel from tracking)
  const handleRideComplete = () => {
    completeRide()
    resetBooking()
    setCurrentView('home')
    setNavTab('home')
    setViewHistory([])
    setShowNotifications(false)
    setProfileView('main')
  }

  // Gift code flow (integrates GiftCodePage)
  const handleOpenGiftCode = () => {
    navigateTo('gift')
  }

  // Wallet / Credits (monetization demo screen)
  const handleOpenWallet = () => {
    navigateTo('wallet')
  }

  // Notifications / Activity Center
  // Opens as rich overlay when on main home (preserves BottomNav + context of app), full navigation fallback elsewhere.
  // This makes the bell + Activity Center feel like first-class integrated part of the demo in Full App Flow.
  const handleOpenNotifications = () => {
    if (currentView === 'home') {
      setShowNotifications(true)
    } else {
      navigateTo('notifications')
    }
  }

  const handleGiftRedeem = (code: string, amount: number) => {
    addGiftBalance(amount)
    // Log to Activity Center so Notifications feels alive + connected to real actions
    addActivity?.({ 
      type: 'promo', 
      title: 'Promo code applied', 
      description: `${code} redeemed — $${amount} added to your gift balance.`, 
      meta: { amount } 
    })
    // Local toast for full-flow feedback (GiftCodePage also shows its own success panel)
    showToastInApp(`Code ${code} redeemed! $${amount} added to wallet`, 'success')
  }

  // Quick Rebook handler: pre-populates via context, toasts, preselects ride, navigates to car-results
  const handleRebook = async (ride: {
    bookingId: string
    rideName: string
    price: number
    destination: string
    completedAt: string
    rating?: number
    tip?: number
  }) => {
    if (!ride?.destination) return

    // 1. Prefill destination (and recent + preferred type) via context helper
    rebookRide(ride)

    // 2. Toast feedback (emerald style success action)
    showToastInApp('Ride details loaded, finding similar options...')

    // 3. Pre-select a matching ride option for instant quick-start (uses same catalog as CarResultScreen)
    const name = (ride.rideName || '').toLowerCase()
    let preselect: RideOption | null = null
    if (name.includes('tesla') || name.includes('model 3')) {
      preselect = { id: 101, name: 'Tesla Model 3', type: 'Electric', price: 12.4, priceDisplay: '$12.40', eta: '3 min', rating: 4.98, seats: 4 }
    } else if (name.includes('camry') || name.includes('toyota')) {
      preselect = { id: 102, name: 'Toyota Camry', type: 'Comfort', price: 8.9, priceDisplay: '$8.90', eta: '5 min', rating: 4.85, seats: 4 }
    } else if (name.includes('cr-v') || name.includes('honda') || name.includes('suv')) {
      preselect = { id: 103, name: 'Honda CR-V', type: 'SUV', price: 14.2, priceDisplay: '$14.20', eta: '7 min', rating: 4.91, seats: 5 }
    } else if (name.includes('bmw') || name.includes('premium')) {
      preselect = { id: 104, name: 'BMW 330i', type: 'Premium', price: 18.75, priceDisplay: '$18.75', eta: '4 min', rating: 4.95, seats: 4 }
    }
    if (preselect) {
      selectRide(preselect)
    }

    // 4. Jump directly into results with prefilled data (natural flow continuation)
    navigateTo('car-results')

    // 5. Kick off findRides (mirrors normal flow; shows context loading overlay briefly)
    try {
      await findRides({ address: ride.destination })
    } catch {
      // demo only
    }
  }

  // Bottom nav handler (only meaningful on main screens)
  const handleTabChange = (tab: NavTab) => {
    setNavTab(tab)
    setShowNotifications(false) // close notifications overlay when switching main tabs

    if (tab === 'home') {
      setCurrentView('home')
    } else if (tab === 'search') {
      // Search tab = open destination flow
      handleOpenDestination()
    } else if (tab === 'messages') {
      setCurrentView('home') // Messages rendered as overlay when tab active
    } else if (tab === 'profile') {
      setCurrentView('home') // Profile rendered as overlay when tab active
      setProfileView('main')
    }
  }

  // Callbacks for Settings/Profile menu items (drilled to enable Messages shortcut, Gift, Help flows)
  const handleOpenMessagesFromSettings = () => {
    setNavTab('messages')
    // profile overlay auto-closes because showProfile depends on navTab
  }

  const handleOpenGiftFromSettings = () => {
    // Fully navigate to dedicated GiftCodePage (light variant) - clears the profile overlay naturally via view change
    handleOpenGiftCode()
  }

  const handleShowHelpFromSettings = () => {
    // Help panel is self-contained inside SettingsPage; just a hint toast
    showToastInApp('Help center: see FAQ + support actions inside the Help panel')
  }

  const handleOpenNotificationsFromProfileOrSettings = () => {
    // Close profile/settings overlays first (they cover the home header bell), then open notifications as overlay
    setNavTab('home')
    setProfileView('main')
    setShowNotifications(false) // ensure clean
    setTimeout(() => {
      handleOpenNotifications()
    }, 60)
  }

  // showToast adapter for components that expect the typed signature (uses existing app toast layer)
  const showToast = (message: string, type?: 'success' | 'error' | 'info') => {
    showToastInApp(message, type || 'info')
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
            onQuickDestination={(loc: { label?: string; sub?: string; subtitle?: string; address?: string } | string) => handleDestinationConfirmed({ address: (typeof loc === 'string' ? loc : (loc?.label || loc?.address || 'Selected Place')), subtitle: (typeof loc === 'object' && loc ? (loc.sub || loc.subtitle) : undefined) })}
            onViewActiveRide={() => setCurrentView('ride-tracking')}
            onOpenNotifications={handleOpenNotifications}
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
                <MessagesScreen 
                  onBack={() => { setNavTab('home'); setCurrentView('home') }} 
                  showToast={showToast} 
                />
              </motion.div>
            )}
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#f8fafc] z-40"
              >
                {profileView === 'main' ? (
                  <ProfileScreen 
                    onBack={() => { setNavTab('home'); setCurrentView('home') }} 
                    onManagePayments={() => {
                      setProfileView('main')
                      navigateTo('add-payment')
                    }}
                    onOpenSettings={() => setProfileView('settings')}
                    onViewActiveRide={() => { setNavTab('home'); setCurrentView('ride-tracking') }}
                    onLogout={() => {
                      setCurrentView('splash')
                      setNavTab('home')
                      setViewHistory([])
                      setProfileView('main')
                      setShowNotifications(false)
                    }}
                    showToast={showToast}
                    onOpenMessages={handleOpenMessagesFromSettings}
                    onOpenNotifications={handleOpenNotificationsFromProfileOrSettings}
                    onOpenWallet={handleOpenWallet}
                  />
                ) : (
                  <SettingsPage 
                    variant="light"
                    onBack={() => setProfileView('main')}
                    onAddPayment={() => {
                      setProfileView('main')
                      navigateTo('add-payment')
                    }}
                    onViewHistory={() => navigateTo('history')}
                    showToast={showToast}
                    onOpenMessages={handleOpenMessagesFromSettings}
                    onOpenGift={handleOpenGiftFromSettings}
                    onShowHelp={handleShowHelpFromSettings}
                    onViewNotifications={handleOpenNotificationsFromProfileOrSettings}
                    onOpenWallet={handleOpenWallet}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications overlay (full-flow): opened from HomeScreen bell (next to greeting/avatar) or Profile/Settings menu items.
              Uses overlay (not full view replace) so BottomNav stays visible — makes Notifications first-class & alive in the demo.
              Gallery mode uses direct screen navigation instead (see App.tsx). */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 bg-[#f8fafc] z-[45]"
              >
                <NotificationsScreen 
                  onBack={() => setShowNotifications(false)} 
                  showToast={showToast} 
                  onViewHistory={() => {
                    setShowNotifications(false)
                    navigateTo('history')
                  }}
                  onFindRides={() => {
                    setShowNotifications(false)
                    setCurrentView('home')
                    setNavTab('home')
                    setTimeout(() => {
                      handleOpenDestination()
                    }, 180)
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
          onCancel={(reason) => {
            // Rich feedback for the new Cancel Ride flow (reason collected safely in RideTrackingScreen sheet)
            const toastMsg = reason
              ? `Ride cancelled: ${reason}. No charge applied.`
              : 'Ride cancelled. No charge applied.'
            showToastInApp(toastMsg, 'success')
            handleRideComplete() // existing cancel logic: clears active ride + resets + returns home
          }}
          onRideCompleted={handleShowRating}
          onComplete={handleRideComplete} // fallback / cancel path
          showToast={showToast}
        />
      )
    }

    if (currentView === 'rating') {
      return (
        <RatingAndTipsPage 
          variant="light"
          onBack={() => {
            // Back from rating without submit -> still complete the ride and home
            handleRideComplete()
          }}
          onSubmit={(rating: number, tip: number) => {
            submitRating(rating, tip)
            // After submit, clear and return home with small delay for success UX
            startLoading('Thank you for your feedback!')
            setTimeout(() => {
              stopLoading()
              handleRideComplete()
            }, 950)
          }}
          onDone={() => {
            handleRideComplete()
          }}
        />
      )
    }

    if (currentView === 'history') {
      return (
        <RideHistoryScreen 
          onBack={goBack}
          onRebook={handleRebook}
        />
      )
    }

    if (currentView === 'notifications') {
      // Fallback full-view render (used if deep-navigated outside home; primary path in full-flow is the home overlay for bell/menu)
      return (
        <NotificationsScreen 
          onBack={goBack}
          showToast={showToast}
          onViewHistory={() => navigateTo('history')}
          onFindRides={() => {
            // Close notifications and kick off destination search flow
            setCurrentView('home')
            setNavTab('home')
            setShowNotifications(false)
            setTimeout(() => {
              handleOpenDestination()
            }, 180)
          }}
        />
      )
    }

    if (currentView === 'gift') {
      return (
        <GiftCodePage 
          variant="light" 
          onBack={goBack} 
          showToast={showToast}
          onRedeem={handleGiftRedeem}
          onViewWallet={handleOpenWallet}
        />
      )
    }

    if (currentView === 'wallet') {
      return (
        <WalletScreen 
          onBack={goBack}
          showToast={showToast}
          onRedeemGift={() => navigateTo('gift')}
          onAddPromo={() => navigateTo('gift')}
        />
      )
    }

    // Fallback
    return <HomeScreen onSearchDestination={handleOpenDestination} onOpenNotifications={handleOpenNotifications} />
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Full-flow local toast layer (for rebook feedback etc; mirrors PhoneFrame toast style/pos, now typed) */}
      <AnimatePresence>
        {appToast && (
          <motion.div
            key="app-toast"
            className={`absolute top-12 left-4 right-4 z-[85] px-4 py-3 rounded-2xl text-sm font-medium shadow-xl text-center pointer-events-none ${
              appToast.type === 'success' ? 'bg-emerald-600 text-white' : 
              appToast.type === 'error' ? 'bg-red-600 text-white' : 
              'bg-[#1c1f2a] text-white'
            }`}
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
          >
            {appToast.message}
          </motion.div>
        )}
      </AnimatePresence>

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
