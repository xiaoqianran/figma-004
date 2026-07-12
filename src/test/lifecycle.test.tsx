import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import {
  BookingProvider,
  useBooking,
  bookingReducer,
  initialState,
  resolveGiftCode,
  GIFT_CODE_AMOUNTS,
  type RideOption,
  type Location,
} from '../context/BookingContext'
import { CardScanScreen } from '../screens/CardScanScreen'
import { SettingsPage } from '../screens/SettingsPage'
import { GiftCodePage } from '../screens/GiftCodePage'
import { BookingConfirmScreen } from '../screens/BookingConfirmScreen'
import { RideTrackingScreen } from '../screens/RideTrackingScreen'
import { RideHistoryScreen } from '../screens/RideHistoryScreen'

const sampleRide: RideOption = {
  id: 101,
  name: 'Tesla Model 3',
  type: 'Electric',
  price: 12.4,
  priceDisplay: '$12.40',
  eta: '3 min',
  rating: 4.98,
  seats: 4,
}

const sampleDest: Location = { address: 'SFO Terminal 2', subtitle: 'Airport' }

function providerWrapper({ children }: { children: React.ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>
}

// ============================================================================
// Pure gift code validation (shared rules)
// ============================================================================
describe('resolveGiftCode (shared validation)', () => {
  it('accepts known codes with correct amounts', () => {
    for (const [code, amount] of Object.entries(GIFT_CODE_AMOUNTS)) {
      const result = resolveGiftCode(code.toLowerCase())
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.code).toBe(code)
        expect(result.amount).toBe(amount)
      }
    }
  })

  it('rejects invalid codes without inventing a credit amount', () => {
    const result = resolveGiftCode('NOTAREALCODE')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Invalid code/i)
      expect(result.code).toBe('NOTAREALCODE')
    }
  })

  it('rejects empty input', () => {
    const result = resolveGiftCode('   ')
    expect(result.ok).toBe(false)
  })
})

// ============================================================================
// Rating → complete → history lifecycle (the core bug fix)
// ============================================================================
describe('Booking lifecycle: rate → complete → history carries rating+tip', () => {
  it('COMPLETE_RIDE archives active ride with lastRating rating and tip', () => {
    let state = bookingReducer(initialState, {
      type: 'SET_DESTINATION',
      payload: sampleDest,
    })
    state = bookingReducer(state, { type: 'SELECT_RIDE', payload: sampleRide })
    state = bookingReducer(state, { type: 'CONFIRM_BOOKING' })
    expect(state.activeRide).not.toBeNull()
    const bookingId = state.activeRide!.bookingId

    // User submits rating while ride is still active (matches RideshareApp order)
    state = bookingReducer(state, {
      type: 'SUBMIT_RATING',
      payload: { rating: 5, tip: 3.5 },
    })
    expect(state.lastRating).toEqual({ rating: 5, tip: 3.5, bookingId })

    // Then complete archives into history WITH rating+tip
    state = bookingReducer(state, { type: 'COMPLETE_RIDE' })
    expect(state.activeRide).toBeNull()

    const archived = state.completedRides.find((r) => r.bookingId === bookingId)
    expect(archived).toBeDefined()
    expect(archived!.rating).toBe(5)
    expect(archived!.tip).toBe(3.5)
    expect(archived!.rideName).toBe('Tesla Model 3')
    expect(archived!.destination).toBe('SFO Terminal 2')
  })

  it('useBooking end-to-end: submitRating then completeRide stores rating in completedRides', async () => {
    const { result } = renderHook(() => useBooking(), { wrapper: providerWrapper })

    act(() => {
      result.current.setDestination(sampleDest)
      result.current.selectRide(sampleRide)
      result.current.confirmBooking()
    })

    const bookingId = result.current.state.activeRide?.bookingId
    expect(bookingId).toBeTruthy()

    act(() => {
      result.current.submitRating(4, 2)
      result.current.completeRide()
    })

    const entry = result.current.state.completedRides.find((r) => r.bookingId === bookingId)
    expect(entry).toBeDefined()
    expect(entry!.rating).toBe(4)
    expect(entry!.tip).toBe(2)
  })
})

// ============================================================================
// Gift redeem: valid credits balance; invalid rejected without credit
// ============================================================================
describe('Gift redeem via useBooking.redeemGiftCode', () => {
  it('valid code increases giftBalance and logs activity', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: providerWrapper })
    const before = result.current.giftBalance

    let redeemResult: ReturnType<typeof result.current.redeemGiftCode>
    act(() => {
      redeemResult = result.current.redeemGiftCode('welcome20')
    })

    expect(redeemResult!.ok).toBe(true)
    expect(result.current.giftBalance).toBe(before + 20)
    expect(result.current.activities[0]?.type).toBe('promo')
    expect(result.current.activities[0]?.meta?.amount).toBe(20)
  })

  it('invalid code does not change giftBalance', () => {
    const { result } = renderHook(() => useBooking(), { wrapper: providerWrapper })
    const before = result.current.giftBalance

    let redeemResult: ReturnType<typeof result.current.redeemGiftCode>
    act(() => {
      redeemResult = result.current.redeemGiftCode('FAKE999')
    })

    expect(redeemResult!.ok).toBe(false)
    expect(result.current.giftBalance).toBe(before)
  })

  it('GiftCodePage redeem wires shared context balance (not silent local-only)', async () => {
    const user = userEvent.setup()
    const onRedeem = vi.fn()

    function Probe() {
      const { giftBalance } = useBooking()
      return (
        <>
          <div data-testid="balance">{giftBalance}</div>
          <GiftCodePage onBack={vi.fn()} onRedeem={onRedeem} variant="light" showToast={vi.fn()} />
        </>
      )
    }

    render(
      <BookingProvider>
        <Probe />
      </BookingProvider>
    )

    const input = screen.getByPlaceholderText(/Enter code/i)
    await user.clear(input)
    await user.type(input, 'GIFT25')
    await user.click(screen.getByRole('button', { name: /Redeem Code/i }))

    await waitFor(() => {
      expect(onRedeem).toHaveBeenCalledWith('GIFT25', 25)
      expect(screen.getByTestId('balance').textContent).toBe('25')
    })
  })

  it('Settings inline redeem rejects invalid codes without crediting', async () => {
    const user = userEvent.setup()
    const showToast = vi.fn()

    function Probe() {
      const { giftBalance } = useBooking()
      return (
        <>
          <div data-testid="balance">{giftBalance}</div>
          <SettingsPage onBack={vi.fn()} showToast={showToast} />
        </>
      )
    }

    render(
      <BookingProvider>
        <Probe />
      </BookingProvider>
    )

    // Open gift panel via menu row
    await user.click(screen.getByRole('button', { name: /Gift Cards/i }))
    // Or redeem button near payments
    // If gift panel already... Gift Cards navigates via onOpenGift which is undefined → opens inline panel
    const input = await screen.findByPlaceholderText(/Enter code/i)
    await user.clear(input)
    await user.type(input, 'TOTALLYFAKE')
    await user.click(screen.getByRole('button', { name: /Redeem & Add to Balance/i }))

    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/Invalid code/i), 'error')
    expect(screen.getByTestId('balance').textContent).toBe('0')
  })
})

// ============================================================================
// Previously dead CTAs: Card Scan + Settings menu navigation
// ============================================================================
describe('Card Scan primary action produces usable outcome', () => {
  it('Scan Now adds a Visa •••• 4523 payment method to context', async () => {
    const user = userEvent.setup()
    const onScanSuccess = vi.fn()
    const showToast = vi.fn()

    function Probe() {
      const { state } = useBooking()
      const hasScanned = state.paymentMethods.some((p) => p.last4 === '4523')
      return (
        <>
          <div data-testid="has-scanned">{hasScanned ? 'yes' : 'no'}</div>
          <CardScanScreen
            variant="dark"
            showToast={showToast}
            onScanSuccess={onScanSuccess}
            onEnterManually={vi.fn()}
          />
        </>
      )
    }

    render(
      <BookingProvider>
        <Probe />
      </BookingProvider>
    )

    expect(screen.getByTestId('has-scanned').textContent).toBe('no')
    await user.click(screen.getByRole('button', { name: /Scan Now/i }))

    await waitFor(
      () => {
        expect(screen.getByTestId('has-scanned').textContent).toBe('yes')
        expect(onScanSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ last4: '4523', brand: 'Visa' })
        )
        expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/4523/i), 'success')
      },
      { timeout: 3000 }
    )
  })
})

describe('Settings menu rows navigate via callbacks (not no-ops)', () => {
  it('Trip History and Wallet rows fire wired handlers', async () => {
    const user = userEvent.setup()
    const onViewHistory = vi.fn()
    const onOpenWallet = vi.fn()
    const onOpenMessages = vi.fn()
    const onOpenGift = vi.fn()

    render(
      <BookingProvider>
        <SettingsPage
          variant="light"
          onBack={vi.fn()}
          onViewHistory={onViewHistory}
          onOpenWallet={onOpenWallet}
          onOpenMessages={onOpenMessages}
          onOpenGift={onOpenGift}
          showToast={vi.fn()}
        />
      </BookingProvider>
    )

    await user.click(screen.getByText('Trip History'))
    expect(onViewHistory).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Wallet & Credits'))
    expect(onOpenWallet).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Message'))
    expect(onOpenMessages).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Gift Cards'))
    expect(onOpenGift).toHaveBeenCalledTimes(1)
  })
})

// ============================================================================
// Gallery empty shells: seed demo booking / active ride
// ============================================================================
describe('Gallery Booking Confirm + Ride Tracking seeding', () => {
  it('BookingConfirmScreen seeds demo data instead of permanent empty shell', async () => {
    render(
      <BookingProvider>
        <BookingConfirmScreen onBack={vi.fn()} onConfirm={vi.fn()} />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Confirm your ride/i)).toBeInTheDocument()
      expect(screen.getByText(/Tesla Model 3/i)).toBeInTheDocument()
      expect(screen.getByText(/Airport Terminal 2/i)).toBeInTheDocument()
      expect(screen.queryByText(/No ride selected/i)).not.toBeInTheDocument()
    })
  })

  it('RideTrackingScreen seeds demo active ride instead of permanent empty shell', async () => {
    render(
      <BookingProvider>
        <RideTrackingScreen onBack={vi.fn()} />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Track your ride/i)).toBeInTheDocument()
      expect(screen.queryByText(/No active ride/i)).not.toBeInTheDocument()
      // Driver from seed
      expect(screen.getByText(/Alex Rivera/i)).toBeInTheDocument()
    })
  })
})

// ============================================================================
// History display: lastRating must not bleed onto later unrated archives
// ============================================================================
describe('RideHistoryScreen rating isolation (no lastRating bleed)', () => {
  it('after rated ride A then unrated complete of ride B, B does not show A rating/tip', async () => {
    const rideA: RideOption = {
      id: 201,
      name: 'Rated Tesla',
      type: 'Electric',
      price: 15,
      priceDisplay: '$15.00',
      eta: '4 min',
      rating: 4.9,
      seats: 4,
    }
    const rideB: RideOption = {
      id: 202,
      name: 'Unrated Camry',
      type: 'Comfort',
      price: 9.5,
      priceDisplay: '$9.50',
      eta: '6 min',
      rating: 4.8,
      seats: 4,
    }

    function Harness() {
      const booking = useBooking()
      const idA = booking.state.completedRides.find((r) => r.rideName === 'Rated Tesla')?.bookingId
      const idB = booking.state.completedRides.find((r) => r.rideName === 'Unrated Camry')?.bookingId
      return (
        <div>
          <button
            type="button"
            data-testid="run-lifecycle"
            onClick={() => {
              // Ride A: confirm → rate 5 / tip 7 → complete (archives with rating)
              booking.setDestination({ address: 'Airport A', subtitle: 'Terminal 1' })
              booking.selectRide(rideA)
              booking.confirmBooking()
              booking.submitRating(5, 7)
              booking.completeRide()

              // Ride B: confirm → complete without rating (cancel-style archive)
              booking.setDestination({ address: 'Gym B', subtitle: 'FitZone' })
              booking.selectRide(rideB)
              booking.confirmBooking()
              // intentionally no submitRating
              booking.completeRide()
            }}
          >
            Run
          </button>
          <div data-testid="id-a">{idA || ''}</div>
          <div data-testid="id-b">{idB || ''}</div>
          <RideHistoryScreen onBack={vi.fn()} />
        </div>
      )
    }

    const user = userEvent.setup()
    render(
      <BookingProvider>
        <Harness />
      </BookingProvider>
    )

    await user.click(screen.getByTestId('run-lifecycle'))

    await waitFor(() => {
      expect(screen.getByText('Rated Tesla')).toBeInTheDocument()
      expect(screen.getByText('Unrated Camry')).toBeInTheDocument()
      expect(screen.getByTestId('id-a').textContent).toMatch(/^BK/)
      expect(screen.getByTestId('id-b').textContent).toMatch(/^BK/)
    })

    const idA = screen.getByTestId('id-a').textContent!
    const idB = screen.getByTestId('id-b').textContent!
    expect(idA).not.toBe(idB)

    // Ride A shows its own rating + tip via shipped data-testid
    expect(screen.getByTestId(`ride-rating-${idA}`)).toHaveTextContent('5.0')
    expect(screen.getByTestId(`ride-tip-${idA}`)).toHaveTextContent('+$7 tip')

    // Ride B must NOT show rating/tip UI (would bleed lastRating from A before the fix)
    expect(screen.queryByTestId(`ride-rating-${idB}`)).not.toBeInTheDocument()
    expect(screen.queryByTestId(`ride-tip-${idB}`)).not.toBeInTheDocument()

    // Tip "+$7 tip" appears only for ride A
    expect(screen.getAllByText(/\+\$7 tip/i).length).toBe(1)
  })
})

describe('Card Scan rescan remains interactive', () => {
  it('Scan again after first scan still adds another payment method', async () => {
    const user = userEvent.setup()
    const onScanSuccess = vi.fn()

    function Probe() {
      const { state } = useBooking()
      const scanCount = state.paymentMethods.filter((p) => p.id.startsWith('pm_scan_')).length
      return (
        <>
          <div data-testid="scan-count">{scanCount}</div>
          <CardScanScreen variant="dark" showToast={vi.fn()} onScanSuccess={onScanSuccess} />
        </>
      )
    }

    render(
      <BookingProvider>
        <Probe />
      </BookingProvider>
    )

    await user.click(screen.getByRole('button', { name: /Scan Now/i }))
    await waitFor(() => expect(Number(screen.getByTestId('scan-count').textContent)).toBe(1), { timeout: 3000 })
    expect(screen.getByRole('button', { name: /Scan Now/i })).toHaveTextContent(/Scan again/i)

    await user.click(screen.getByRole('button', { name: /Scan Now/i }))
    await waitFor(() => expect(Number(screen.getByTestId('scan-count').textContent)).toBe(2), { timeout: 3000 })
    expect(onScanSuccess).toHaveBeenCalledTimes(2)
  })
})

// ============================================================================
// Full booking field survival through reducer path Destination → Confirm → Track → Rate
// ============================================================================
describe('Full booking field survival (reducer happy path)', () => {
  it('destination + ride survive confirm into activeRide and rating archive', () => {
    let state = bookingReducer(initialState, {
      type: 'LOGIN',
      payload: { name: 'Test User', email: 't@test.com' },
    })
    state = bookingReducer(state, {
      type: 'SET_DESTINATION',
      payload: { address: 'Work', subtitle: 'Tower B' },
    })
    state = bookingReducer(state, { type: 'SELECT_RIDE', payload: sampleRide })

    // Confirm creates activeRide with both endpoints
    state = bookingReducer(state, { type: 'CONFIRM_BOOKING' })
    expect(state.activeRide?.destination.address).toBe('Work')
    expect(state.activeRide?.ride.name).toBe('Tesla Model 3')
    expect(state.activeRide?.pickup.address).toBeTruthy()

    // Progress status without losing booking context
    state = bookingReducer(state, { type: 'UPDATE_RIDE_STATUS', payload: 'in_progress' })
    expect(state.activeRide?.destination.address).toBe('Work')
    expect(state.activeRide?.bookingId).toMatch(/^BK/)

    state = bookingReducer(state, { type: 'UPDATE_RIDE_STATUS', payload: 'completed' })
    state = bookingReducer(state, { type: 'SUBMIT_RATING', payload: { rating: 5, tip: 4 } })
    const id = state.activeRide!.bookingId
    state = bookingReducer(state, { type: 'COMPLETE_RIDE' })
    state = bookingReducer(state, { type: 'RESET_BOOKING' })

    const historyEntry = state.completedRides.find((r) => r.bookingId === id)
    expect(historyEntry?.destination).toBe('Work')
    expect(historyEntry?.rating).toBe(5)
    expect(historyEntry?.tip).toBe(4)
  })
})
