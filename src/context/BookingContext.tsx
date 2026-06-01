import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
export interface Location {
  address: string
  subtitle?: string
}

export interface RideOption {
  id: number
  name: string
  type: string
  price: number // numeric for calculations
  priceDisplay: string
  eta: string
  rating: number
  seats: number
}

export interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'applepay' | 'googlepay' | 'cash'
  last4?: string
  brand?: string
  isDefault?: boolean
}

export type RideStatus = 'confirmed' | 'driver_enroute' | 'arriving' | 'in_progress' | 'completed'

export interface ActiveRide {
  bookingId: string
  ride: RideOption
  status: RideStatus
  driver: {
    name: string
    rating: number
    car: string
    plate: string
    etaMinutes: number
  }
  pickup: Location
  destination: Location
}

export interface BookingState {
  // Auth
  isAuthenticated: boolean
  user: { id: string; name: string; email: string; phone?: string } | null

  // Booking data
  pickup: Location | null
  destination: Location | null
  selectedRide: RideOption | null
  preferredRideType: 'economy' | 'comfort' | 'xl'
  paymentMethod: PaymentMethod | null
  paymentMethods: PaymentMethod[]

  // App flow UI
  isLoading: boolean
  loadingMessage: string

  // Post-booking
  activeRide: ActiveRide | null

  // Rating after ride completion
  lastRating: { rating: number; tip: number; bookingId?: string } | null

  // Completed ride history (persisted demo data)
  completedRides: Array<{
    bookingId: string
    rideName: string
    price: number
    destination: string
    completedAt: string
    rating?: number
    tip?: number
  }>

  // Recently used for convenience
  recentDestinations: Location[]

  // User preferences (persisted in demo)
  preferences: {
    notificationsEnabled: boolean
    theme: 'light' | 'dark'
  }

  // Demo gift / promo balance (updated via GiftCodePage redemption)
  giftBalance: number
}

type BookingAction =
  | { type: 'LOGIN'; payload: { name: string; email: string; phone?: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PICKUP'; payload: Location }
  | { type: 'SET_DESTINATION'; payload: Location }
  | { type: 'SELECT_RIDE'; payload: RideOption }
  | { type: 'SET_PREFERRED_RIDE_TYPE'; payload: 'economy' | 'comfort' | 'xl' }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_USER'; payload: { name?: string; email?: string; phone?: string } }
  | { type: 'SET_PREFERENCES'; payload: Partial<{ notificationsEnabled: boolean; theme: 'light' | 'dark' }> }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'CONFIRM_BOOKING' }
  | { type: 'UPDATE_RIDE_STATUS'; payload: RideStatus }
  | { type: 'COMPLETE_RIDE' }
  | { type: 'SUBMIT_RATING'; payload: { rating: number; tip: number } }
  | { type: 'RESET_BOOKING' }
  | { type: 'ADD_RECENT_DESTINATION'; payload: Location }
  | { type: 'ADD_COMPLETED_RIDE'; payload: { bookingId: string; rideName: string; price: number; destination: string; rating?: number; tip?: number } }
  | { type: 'ADD_GIFT_BALANCE'; payload: number }
  | { type: 'SET_GIFT_BALANCE'; payload: number }

const initialState: BookingState = {
  isAuthenticated: false,
  user: null,
  pickup: { address: 'Current Location', subtitle: '123 Market Street, SF' },
  destination: null,
  selectedRide: null,
  preferredRideType: 'comfort',
  paymentMethod: {
    id: 'pm_1',
    type: 'visa',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  },
  paymentMethods: [
    {
      id: 'pm_1',
      type: 'visa',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: 'pm_2',
      type: 'mastercard',
      last4: '8888',
      brand: 'Mastercard',
    },
    {
      id: 'pm_3',
      type: 'applepay',
      last4: '',
      brand: 'Apple Pay',
    },
    {
      id: 'pm_4',
      type: 'cash',
      last4: '',
      brand: 'Cash',
    },
  ],
  isLoading: false,
  loadingMessage: '',
  activeRide: null,
  lastRating: null,
  completedRides: [
    { bookingId: 'BK492183', rideName: 'Tesla Model 3', price: 12.4, destination: 'Home', completedAt: '2h ago', rating: 5, tip: 3 },
    { bookingId: 'BK481902', rideName: 'Toyota Camry', price: 8.9, destination: 'Work', completedAt: 'Yesterday', rating: 4, tip: 0 },
  ],
  recentDestinations: [
    { address: 'Home', subtitle: '456 Oak Avenue' },
    { address: 'Work', subtitle: '1 Market Street, Tower B' },
  ],
  preferences: {
    notificationsEnabled: true,
    theme: 'light',
  },
  giftBalance: 0,
}

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: {
          id: 'u_' + Date.now(),
          name: action.payload.name,
          email: action.payload.email,
          phone: action.payload.phone,
        },
      }

    case 'LOGOUT':
      return {
        ...initialState,
        // keep some defaults
        recentDestinations: state.recentDestinations,
      }

    case 'SET_PICKUP':
      return { ...state, pickup: action.payload }

    case 'SET_DESTINATION':
      return { ...state, destination: action.payload }

    case 'SELECT_RIDE':
      return { ...state, selectedRide: action.payload }

    case 'SET_PREFERRED_RIDE_TYPE':
      return { ...state, preferredRideType: action.payload }

    case 'SET_PAYMENT_METHOD': {
      const pm = action.payload
      const existing = state.paymentMethods || []
      const updatedList = existing.some((p) => p.id === pm.id)
        ? existing.map((p) => ({ ...p, isDefault: p.id === pm.id }))
        : [...existing, { ...pm, isDefault: true }]
      return {
        ...state,
        paymentMethod: pm,
        paymentMethods: updatedList,
      }
    }

    case 'ADD_PAYMENT_METHOD': {
      const pm = action.payload
      const existing = state.paymentMethods || []
      const filtered = existing.filter((p) => p.id !== pm.id)
      return {
        ...state,
        paymentMethods: [...filtered, pm],
        paymentMethod: pm,
      }
    }

    case 'UPDATE_USER':
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      }

    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
      }

    case 'CONFIRM_BOOKING': {
      if (!state.selectedRide || !state.pickup || !state.destination) return state

      const bookingId = 'BK' + Math.floor(100000 + Math.random() * 900000)

      const driver = {
        name: ['Alex Rivera', 'Jordan Kim', 'Sam Patel', 'Taylor Brooks'][Math.floor(Math.random() * 4)],
        rating: 4.85 + Math.random() * 0.12,
        car: state.selectedRide.name.includes('Tesla') ? 'Tesla Model 3 • White' : 'Toyota Camry • Silver',
        plate: '7ABC' + Math.floor(100 + Math.random() * 900),
        etaMinutes: parseInt(state.selectedRide.eta) || 4,
      }

      return {
        ...state,
        activeRide: {
          bookingId,
          ride: state.selectedRide,
          status: 'confirmed',
          driver,
          pickup: state.pickup,
          destination: state.destination,
        },
        isLoading: false,
        loadingMessage: '',
      }
    }

    case 'UPDATE_RIDE_STATUS':
      if (!state.activeRide) return state
      return {
        ...state,
        activeRide: { ...state.activeRide, status: action.payload },
      }

    case 'COMPLETE_RIDE': {
      // Archive current active ride into history if present
      let newCompleted = state.completedRides
      if (state.activeRide) {
        const ar = state.activeRide
        const already = state.completedRides.some(r => r.bookingId === ar.bookingId)
        if (!already) {
          newCompleted = [{
            bookingId: ar.bookingId,
            rideName: ar.ride.name,
            price: ar.ride.price,
            destination: ar.destination.address,
            completedAt: 'Just now',
          }, ...state.completedRides].slice(0, 12)
        }
      }
      return {
        ...state,
        activeRide: null,
        selectedRide: null,
        destination: null,
        completedRides: newCompleted,
      }
    }

    case 'SUBMIT_RATING':
      return {
        ...state,
        lastRating: {
          rating: action.payload.rating,
          tip: action.payload.tip,
          bookingId: state.activeRide?.bookingId,
        },
      }

    case 'RESET_BOOKING':
      return {
        ...state,
        destination: null,
        selectedRide: null,
        isLoading: false,
        loadingMessage: '',
      }

    case 'ADD_RECENT_DESTINATION': {
      // Avoid duplicates
      const exists = state.recentDestinations.some(d => d.address === action.payload.address)
      const updatedRecents = exists
        ? state.recentDestinations
        : [action.payload, ...state.recentDestinations].slice(0, 6)
      return { ...state, recentDestinations: updatedRecents }
    }

    case 'ADD_COMPLETED_RIDE': {
      const p = action.payload
      const exists = state.completedRides.some(r => r.bookingId === p.bookingId)
      if (exists) return state
      return {
        ...state,
        completedRides: [{
          bookingId: p.bookingId,
          rideName: p.rideName,
          price: p.price,
          destination: p.destination,
          completedAt: 'Just now',
          rating: p.rating,
          tip: p.tip,
        }, ...state.completedRides].slice(0, 12),
      }
    }

    case 'ADD_GIFT_BALANCE':
      return {
        ...state,
        giftBalance: (state.giftBalance || 0) + (action.payload || 0),
      }

    case 'SET_GIFT_BALANCE':
      return {
        ...state,
        giftBalance: Math.max(0, action.payload || 0),
      }

    default:
      return state
  }
}

interface BookingContextValue {
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
  // Convenience action creators
  login: (name: string, email: string, phone?: string) => void
  logout: () => void
  setPickup: (loc: Location) => void
  setDestination: (loc: Location) => void
  selectRide: (ride: RideOption) => void
  setPreferredRideType: (type: 'economy' | 'comfort' | 'xl') => void
  setPaymentMethod: (pm: PaymentMethod) => void
  addPaymentMethod: (pm: PaymentMethod) => void
  updateUser: (updates: { name?: string; email?: string; phone?: string }) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  startLoading: (message: string) => void
  stopLoading: () => void
  confirmBooking: () => void
  updateRideStatus: (status: RideStatus) => void
  completeRide: () => void
  submitRating: (rating: number, tip: number) => void
  resetBooking: () => void
  addRecentDestination: (loc: Location) => void
  addCompletedRide: (ride: { bookingId: string; rideName: string; price: number; destination: string; rating?: number; tip?: number }) => void
  rebookRide: (ride: { rideName?: string; destination: string; price?: number }) => void
  // Gift / promo balance (demo - integrated with GiftCodePage)
  giftBalance: number
  addGiftBalance: (amount: number) => void
  setGiftBalance: (amount: number) => void
  // Fake API helpers
  findRides: (destination: Location) => Promise<RideOption[]>
  processPayment: () => Promise<boolean>
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Optional persistence (survives refresh for demo)
  useEffect(() => {
    const saved = localStorage.getItem('rideshare_booking_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Only restore safe parts
        if (parsed.isAuthenticated && parsed.user) {
          dispatch({ type: 'LOGIN', payload: parsed.user })
        }
        if (parsed.paymentMethod) {
          dispatch({ type: 'SET_PAYMENT_METHOD', payload: parsed.paymentMethod })
        }
        if (parsed.paymentMethods && Array.isArray(parsed.paymentMethods)) {
          // Restore full list; selected will be synced via last SET or first default
          parsed.paymentMethods.forEach((pm: PaymentMethod) => {
            if (pm.isDefault) {
              dispatch({ type: 'SET_PAYMENT_METHOD', payload: pm })
            }
          })
        }
        if (parsed.preferences) {
          dispatch({ type: 'SET_PREFERENCES', payload: parsed.preferences })
        }
        if (typeof parsed.giftBalance === 'number') {
          dispatch({ type: 'SET_GIFT_BALANCE', payload: parsed.giftBalance })
        }
      } catch {
        // ignore corrupted storage
      }
    }
  }, [])

  useEffect(() => {
    // Persist limited state
    const toSave = {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      paymentMethod: state.paymentMethod,
      paymentMethods: state.paymentMethods,
      preferences: state.preferences,
      giftBalance: state.giftBalance,
    }
    localStorage.setItem('rideshare_booking_state', JSON.stringify(toSave))
  }, [state.isAuthenticated, state.user, state.paymentMethod, state.paymentMethods, state.preferences, state.giftBalance])

  const value: BookingContextValue = {
    state,
    dispatch,

    login: (name, email, phone) =>
      dispatch({ type: 'LOGIN', payload: { name, email, phone } }),

    logout: () => dispatch({ type: 'LOGOUT' }),

    setPickup: (loc) => dispatch({ type: 'SET_PICKUP', payload: loc }),

    setDestination: (loc) => {
      dispatch({ type: 'SET_DESTINATION', payload: loc })
      dispatch({ type: 'ADD_RECENT_DESTINATION', payload: loc })
    },

    selectRide: (ride) => dispatch({ type: 'SELECT_RIDE', payload: ride }),

    setPreferredRideType: (type) => dispatch({ type: 'SET_PREFERRED_RIDE_TYPE', payload: type }),

    setPaymentMethod: (pm) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: pm }),

    addPaymentMethod: (pm) => dispatch({ type: 'ADD_PAYMENT_METHOD', payload: pm }),

    updateUser: (updates) => dispatch({ type: 'UPDATE_USER', payload: updates }),

    setNotificationsEnabled: (enabled) =>
      dispatch({ type: 'SET_PREFERENCES', payload: { notificationsEnabled: enabled } }),

    setTheme: (theme) => dispatch({ type: 'SET_PREFERENCES', payload: { theme } }),

    startLoading: (message) =>
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message } }),

    stopLoading: () => dispatch({ type: 'SET_LOADING', payload: { isLoading: false } }),

    confirmBooking: () => dispatch({ type: 'CONFIRM_BOOKING' }),

    updateRideStatus: (status) => dispatch({ type: 'UPDATE_RIDE_STATUS', payload: status }),

    completeRide: () => dispatch({ type: 'COMPLETE_RIDE' }),

    submitRating: (rating, tip) => dispatch({ type: 'SUBMIT_RATING', payload: { rating, tip } }),

    resetBooking: () => dispatch({ type: 'RESET_BOOKING' }),

    addRecentDestination: (loc) =>
      dispatch({ type: 'ADD_RECENT_DESTINATION', payload: loc }),

    addCompletedRide: (ride) =>
      dispatch({ type: 'ADD_COMPLETED_RIDE', payload: ride }),

    // Gift balance demo actions
    giftBalance: state.giftBalance || 0,
    addGiftBalance: (amount) => dispatch({ type: 'ADD_GIFT_BALANCE', payload: amount }),
    setGiftBalance: (amount) => dispatch({ type: 'SET_GIFT_BALANCE', payload: amount }),

    rebookRide: (ride) => {
      if (!ride?.destination) return
      const destLoc: Location = {
        address: ride.destination,
        subtitle: ride.rideName ? `Rebook • ${ride.rideName}` : 'From history',
      }
      dispatch({ type: 'SET_DESTINATION', payload: destLoc })
      dispatch({ type: 'ADD_RECENT_DESTINATION', payload: destLoc })

      // Infer preferredRideType from past rideName for natural prefill in flow
      const name = (ride.rideName || '').toLowerCase()
      let pType: 'economy' | 'comfort' | 'xl' = 'comfort'
      if (name.includes('suv') || name.includes('cr-v') || name.includes('xl') || name.includes('honda')) {
        pType = 'xl'
      } else if (name.includes('tesla') || name.includes('bmw') || name.includes('premium') || name.includes('electric')) {
        pType = 'comfort'
      } else if (name.includes('camry') || name.includes('toyota')) {
        pType = 'economy'
      }
      dispatch({ type: 'SET_PREFERRED_RIDE_TYPE', payload: pType })
    },

    // Fake API calls with realistic delays
    findRides: async (destination: Location): Promise<RideOption[]> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Finding rides near you...' } })

      // Simulate network + matching delay
      await new Promise(resolve => setTimeout(resolve, 1350))

      const baseRides: RideOption[] = [
        {
          id: 101,
          name: 'Tesla Model 3',
          type: 'Electric',
          price: 12.4,
          priceDisplay: '$12.40',
          eta: '3 min',
          rating: 4.98,
          seats: 4,
        },
        {
          id: 102,
          name: 'Toyota Camry',
          type: 'Comfort',
          price: 8.9,
          priceDisplay: '$8.90',
          eta: '5 min',
          rating: 4.85,
          seats: 4,
        },
        {
          id: 103,
          name: 'Honda CR-V',
          type: 'SUV',
          price: 14.2,
          priceDisplay: '$14.20',
          eta: '7 min',
          rating: 4.91,
          seats: 5,
        },
        {
          id: 104,
          name: 'BMW 330i',
          type: 'Premium',
          price: 18.75,
          priceDisplay: '$18.75',
          eta: '4 min',
          rating: 4.95,
          seats: 4,
        },
      ]

      // Slightly vary price based on destination length for fun
      const multiplier = 0.95 + (destination.address.length % 7) / 40
      const rides = baseRides.map(r => ({
        ...r,
        price: Math.round(r.price * multiplier * 100) / 100,
        priceDisplay: `$${(r.price * multiplier).toFixed(2)}`,
      }))

      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
      return rides
    },

    processPayment: async (): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'Processing payment...' } })
      await new Promise(resolve => setTimeout(resolve, 1650))
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } })
      // 98% success rate
      return Math.random() > 0.02
    },
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    // Fallback for isolated usage or tests — return safe defaults (no-op)
    return {
      state: initialState,
      dispatch: () => {},
      login: () => {},
      logout: () => {},
      setPickup: () => {},
      setDestination: () => {},
      selectRide: () => {},
      setPreferredRideType: () => {},
      setPaymentMethod: () => {},
      addPaymentMethod: () => {},
      updateUser: () => {},
      setNotificationsEnabled: () => {},
      setTheme: () => {},
      startLoading: () => {},
      stopLoading: () => {},
      confirmBooking: () => {},
      updateRideStatus: () => {},
      completeRide: () => {},
      submitRating: () => {},
      resetBooking: () => {},
      addRecentDestination: () => {},
      addCompletedRide: () => {},
      rebookRide: () => {},
      giftBalance: 0,
      addGiftBalance: () => {},
      setGiftBalance: () => {},
      findRides: async () => [],
      processPayment: async () => true,
    } as BookingContextValue
  }
  return context
}

// Exported for testability (reducer + initial state are pure and valuable to verify directly)
export { bookingReducer, initialState }
