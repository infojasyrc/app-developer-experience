import { ReactNode, useEffect, useState } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'

const initialTheme = localStorage.getItem('theme') || 'light'

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme] = useState(initialTheme)

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}

export { ThemeProvider }
