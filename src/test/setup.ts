import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'

// BookingProvider persists giftBalance / activities / auth to localStorage.
// Clear between tests so suites don't pollute each other.
beforeEach(() => {
  localStorage.clear()
})
