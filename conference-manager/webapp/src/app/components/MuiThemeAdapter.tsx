'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { useThemeMode } from '@/app/lib/contexts/ThemeContext'
import { darkTheme, lightTheme } from '@/app/lib/themes/muiTheme'

interface Props {
  children: ReactNode
}

/**
 * Reads the current ThemeContext mode and applies the corresponding MUI
 * ThemeProvider. Kept as a separate component from ThemeRegistry so the
 * emotion CacheProvider (which must be an ancestor in the tree) can be set
 * up before this component calls useThemeMode.
 */
export function MuiThemeAdapter({ children }: Props) {
  const { mode } = useThemeMode()

  return (
    <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
