import { createTheme } from '@material-ui/core/styles'
import { colors } from './theme/colors'

export const theme = createTheme({
  barTitle: {
    marginLeft: '0',
    fontFamily: 'Exo',
    color: colors.white,
  },
  colors: colors,
  palette: {
    primary: {
      main: colors.white,
      contrastText: colors.black,
    },
    secondary: {
      main: colors.lightOrange,
      contrastText: colors.white,
    },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
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
    useNextVariants: true,
  },
  mainContainer: {
    position: 'fixed',
    backgroundColor: colors.lightGray,
    height: '99.9%',
    width: '100%',
    overflow: 'auto',
    borderRadius: 0,
  },
})
