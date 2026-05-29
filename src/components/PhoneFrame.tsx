import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface PhoneFrameProps {
  children: React.ReactNode
  isDark?: boolean
  className?: string
  // Optional overlay (e.g. full-screen loading / processing modals inside the device)
  overlay?: React.ReactNode
  // Toasts rendered at top of screen area with smooth enter/exit
  toasts?: ToastItem[]
  onDismissToast?: (id: number) => void
}

export function PhoneFrame({ 
  children, 
  isDark = false, 
  className = '',
  overlay,
  toasts = [],
  onDismissToast
}: PhoneFrameProps) {
  const screenClass = `phone-screen ${isDark ? 'dark' : 'light'} relative overflow-hidden`

  return (
    <div className={`phone-frame mx-auto ${className}`}>
      <div className={screenClass}>
        {/* Screen content (current page) */}
        {children}

        {/* Authentic Dynamic Island (iPhone 14 Pro style) - inside display */}
        <div className="dynamic-island" aria-hidden="true">
          {/* camera + sensor cluster already styled via CSS pseudo */}
        </div>

        {/* Home indicator bar - subtle tactile affordance */}
        <div className="home-indicator" aria-hidden="true" />

        {/* Toast layer - positioned inside the device for realism */}
        <div className="absolute top-12 left-0 right-0 z-[70] px-4 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast, index) => (
              <motion.div
                key={toast.id}
                className={`toast mb-2 ${toast.type}`}
                style={{ marginTop: index > 0 ? '4px' : 0 }}
                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 420, 
                  damping: 28, 
                  mass: 0.8 
                }}
                onClick={() => onDismissToast?.(toast.id)}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Overlay layer for loading states, processing flows, modals - appears above everything inside device */}
        <AnimatePresence>
          {overlay && (
            <motion.div 
              className="absolute inset-0 z-[65] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {overlay}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
