'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  getHapticUserEnabled,
  setHapticUserEnabled,
} from '@/lib/haptics/haptics'

const STORAGE_KEY = 'dbc-haptics-enabled'

type HapticContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const HapticContext = createContext<HapticContextValue | null>(null)

export function HapticProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const nextEnabled = stored === null ? true : stored === 'true'
    setEnabledState(nextEnabled)
    setHapticUserEnabled(nextEnabled)
  }, [])

  const setEnabled = useCallback((nextEnabled: boolean) => {
    setEnabledState(nextEnabled)
    setHapticUserEnabled(nextEnabled)
    localStorage.setItem(STORAGE_KEY, String(nextEnabled))
  }, [])

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
    }),
    [enabled, setEnabled],
  )

  return <HapticContext.Provider value={value}>{children}</HapticContext.Provider>
}

export function useHapticPreferences() {
  const context = useContext(HapticContext)
  if (!context) {
    return {
      enabled: getHapticUserEnabled(),
      setEnabled: setHapticUserEnabled,
    }
  }
  return context
}
