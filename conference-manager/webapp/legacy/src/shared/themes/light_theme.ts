import { createTheme } from '@material-ui/core/styles'
import { colors } from './colors'

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.black,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.lightOrange,
      contrastText: colors.white,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
})
