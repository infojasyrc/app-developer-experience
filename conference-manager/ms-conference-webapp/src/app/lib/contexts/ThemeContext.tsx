'use client'

import React, { createContext, ReactNode, startTransition, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

interface ThemeContextProps {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'light',
  toggleTheme: () => {},
})

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  // Always start with 'light' so the server and client produce identical HTML on
  // the first render. After hydration, a useEffect syncs the stored preference —
  // eliminating the server/client branch that caused the hydration mismatch.
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (stored === 'light' || stored === 'dark') {
      startTransition(() => setMode(stored))
    }
  }, [])

  const toggleTheme = () => {
    setMode(prev => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeMode = (): ThemeContextProps => useContext(ThemeContext)

export default ThemeContext
