import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SplashScreen } from '../screens/SplashScreen'
import { SignInScreen } from '../screens/SignInScreen'
import { DestinationScreen } from '../screens/DestinationScreen'
import { CarResultScreen } from '../screens/CarResultScreen'

describe('Smoke Tests - Rideshare UI Kit Screens', () => {
  it('renders SplashScreen with primary CTAs', () => {
    const onCreate = vi.fn()
    const onLogin = vi.fn()
    render(<SplashScreen variant="dark" onCreateAccount={onCreate} onLogin={onLogin} />)

    expect(screen.getByText(/Create New Account/i)).toBeInTheDocument()
    expect(screen.getByText(/Log In/i)).toBeInTheDocument()
  })

  it('calls handlers when Splash CTAs are clicked', () => {
    const onCreate = vi.fn()
    const onLogin = vi.fn()
    render(<SplashScreen variant="light" onCreateAccount={onCreate} onLogin={onLogin} />)

    fireEvent.click(screen.getByText(/Create New Account/i))
    expect(onCreate).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText(/Log In/i))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })

  it('renders SignInScreen form fields and primary action', () => {
    const onLogin = vi.fn()
    render(<SignInScreen variant="welcome" onLogin={onLogin} />)

    // Email/phone and password inputs exist
    expect(screen.getByPlaceholderText(/Email or Phone/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument()
  })

  it('renders DestinationScreen saved places and search', () => {
    const onBack = vi.fn()
    render(<DestinationScreen onBack={onBack} />)

    expect(screen.getByText(/Where do you want to go/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Search destination/i)).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('renders CarResultScreen with ride options and primary CTA', () => {
    const onConfirm = vi.fn()
    render(<CarResultScreen onConfirmRide={onConfirm} />)

    // Use getAllByText since "Choose a ride" appears in header + bottom button in current impl
    const chooseRideEls = screen.getAllByText(/Choose a ride/i)
    expect(chooseRideEls.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Tesla Model 3/i)).toBeInTheDocument()
    // Primary action button exists (text varies slightly by variant impl)
    expect(screen.getByRole('button', { name: /Choose a ride|Confirm Ride/i })).toBeInTheDocument()
  })
})
