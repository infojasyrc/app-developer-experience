import { createTheme, Theme } from '@mui/material/styles'

/**
 * Shared token values mirroring the Tailwind palette defined in tailwind.config.ts.
 * A single source of truth so MUI components and Tailwind utilities use the same colours.
 */
const tokens = {
  // Brand
  mainBlue:       '#5669FF',
  darkerBlue:     '#3D37F1',
  lightBlue:      '#F2F2FA',
  disabledButton: '#929EFF',

  // Semantic
  green:  '#13CB89',
  red:    '#ff0505',
  yellow: '#E9B741',

  // Neutrals
  dark:      '#3c3c3c',
  boldGray:  '#6A6A6A',
  gray:      '#9a9a9a',
  lightGray: '#f6f7f7',
  white:     '#ffffff',

  // Font stack (matches Tailwind `fontFamily.sans`)
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
}

export const lightTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  tokens.mainBlue,
      dark:  tokens.darkerBlue,
      light: tokens.lightBlue,
    },
    success: { main: tokens.green },
    error:   { main: tokens.red   },
    warning: { main: tokens.yellow },
    text: {
      primary:   tokens.dark,
      secondary: tokens.boldGray,
      disabled:  tokens.gray,
    },
    background: {
      default: tokens.lightGray,
      paper:   tokens.white,
    },
    action: {
      disabled:           tokens.disabledButton,
      disabledBackground: tokens.lightBlue,
    },
  },
  typography: {
    fontFamily: tokens.fontFamily,
  },
  shape: {
    borderRadius: 8,
  },
})

export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main:  tokens.mainBlue,
      dark:  tokens.darkerBlue,
      light: tokens.lightBlue,
    },
    success: { main: tokens.green  },
    error:   { main: tokens.red    },
    warning: { main: tokens.yellow },
    text: {
      primary:   tokens.white,
      secondary: tokens.gray,
      disabled:  tokens.boldGray,
    },
    background: {
      default: '#121212',
      paper:   '#1e1e1e',
    },
    action: {
      disabled:           tokens.disabledButton,
      disabledBackground: '#2a2a2a',
    },
  },
  typography: {
    fontFamily: tokens.fontFamily,
  },
  shape: {
    borderRadius: 8,
  },
})
