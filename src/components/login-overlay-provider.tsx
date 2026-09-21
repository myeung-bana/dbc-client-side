'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

const LoginOverlay = dynamic(
  () =>
    import('@/components/login-overlay').then((mod) => ({
      default: mod.LoginOverlay,
    })),
  { ssr: false },
)

type OpenLoginOptions = {
  next?: string | null
  error?: string | null
}

type LoginOverlayContextValue = {
  isOpen: boolean
  openLogin: (options?: OpenLoginOptions) => void
  closeLogin: () => void
}

const LoginOverlayContext = createContext<LoginOverlayContextValue | null>(null)

export function LoginOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  // Stays true after the first open so the overlay keeps its close animation.
  const [isMounted, setIsMounted] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [initialError, setInitialError] = useState<string | null>(null)

  const openLogin = useCallback((options?: OpenLoginOptions) => {
    setNextPath(options?.next ?? null)
    setInitialError(options?.error ?? null)
    setIsMounted(true)
    setIsOpen(true)
  }, [])

  const closeLogin = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(
    () => ({ isOpen, openLogin, closeLogin }),
    [isOpen, openLogin, closeLogin],
  )

  return (
    <LoginOverlayContext.Provider value={value}>
      {children}
      {isMounted ? (
        <LoginOverlay
          open={isOpen}
          onOpenChange={setIsOpen}
          nextPath={nextPath}
          initialError={initialError}
        />
      ) : null}
    </LoginOverlayContext.Provider>
  )
}

export function useLoginOverlay() {
  const context = useContext(LoginOverlayContext)
  if (!context) {
    throw new Error('useLoginOverlay must be used within LoginOverlayProvider')
  }
  return context
}
