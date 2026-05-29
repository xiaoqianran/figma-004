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
  paymentMethod: PaymentMethod | null

  // App flow UI
  isLoading: boolean
  loadingMessage: string

  // Post-booking
  activeRide: ActiveRide | null

  // Recently used for convenience
  recentDestinations: Location[]
}

type BookingAction =
  | { type: 'LOGIN'; payload: { name: string; email: string; phone?: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PICKUP'; payload: Location }
  | { type: 'SET_DESTINATION'; payload: Location }
  | { type: 'SELECT_RIDE'; payload: RideOption }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'CONFIRM_BOOKING' }
  | { type: 'UPDATE_RIDE_STATUS'; payload: RideStatus }
  | { type: 'COMPLETE_RIDE' }
  | { type: 'RESET_BOOKING' }
  | { type: 'ADD_RECENT_DESTINATION'; payload: Location }

const initialState: BookingState = {
  isAuthenticated: false,
  user: null,
  pickup: { address: 'Current Location', subtitle: '123 Market Street, SF' },
  destination: null,
  selectedRide: null,
  paymentMethod: {
    id: 'pm_1',
    type: 'visa',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  },
  isLoading: false,
  loadingMessage: '',
  activeRide: null,
  recentDestinations: [
    { address: 'Home', subtitle: '456 Oak Avenue' },
    { address: 'Work', subtitle: '1 Market Street, Tower B' },
  ],
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

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }

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

    case 'COMPLETE_RIDE':
      return {
        ...state,
        activeRide: null,
        selectedRide: null,
        destination: null,
        // keep pickup and payment
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
  setPaymentMethod: (pm: PaymentMethod) => void
  startLoading: (message: string) => void
  stopLoading: () => void
  confirmBooking: () => void
  updateRideStatus: (status: RideStatus) => void
  completeRide: () => void
  resetBooking: () => void
  addRecentDestination: (loc: Location) => void
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
    }
    localStorage.setItem('rideshare_booking_state', JSON.stringify(toSave))
  }, [state.isAuthenticated, state.user, state.paymentMethod])

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

    setPaymentMethod: (pm) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: pm }),

    startLoading: (message) =>
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message } }),

    stopLoading: () => dispatch({ type: 'SET_LOADING', payload: { isLoading: false } }),

    confirmBooking: () => dispatch({ type: 'CONFIRM_BOOKING' }),

    updateRideStatus: (status) => dispatch({ type: 'UPDATE_RIDE_STATUS', payload: status }),

    completeRide: () => dispatch({ type: 'COMPLETE_RIDE' }),

    resetBooking: () => dispatch({ type: 'RESET_BOOKING' }),

    addRecentDestination: (loc) =>
      dispatch({ type: 'ADD_RECENT_DESTINATION', payload: loc }),

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
      setPaymentMethod: () => {},
      startLoading: () => {},
      stopLoading: () => {},
      confirmBooking: () => {},
      updateRideStatus: () => {},
      completeRide: () => {},
      resetBooking: () => {},
      addRecentDestination: () => {},
      findRides: async () => [],
      processPayment: async () => true,
    } as BookingContextValue
  }
  return context
}
