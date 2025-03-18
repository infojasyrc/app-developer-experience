import { createStyles, makeStyles } from '@material-ui/core'
import { colors } from '../../styles/theme/colors'
export const headerStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: 24,
      paddingRight: 8,
      [theme.breakpoints.up('md')]: {
        paddingLeft: 10,
        paddingRight: 16,
      }
    },
    version: {
      color: colors.gray,
      position: 'absolute',
      top: '0',
      right: 10,
      fontSize: 'xx-small',
    },
    userEmail: {
      color: colors.blue,
      padding: 17,
      fontFamily: 'Exo',
      fontWeight: 'bold',
      fontSize: 14,
    },
    buttonLogin: {
      color: colors.white,
      backgroundColor: colors.mainBlue,
      fontSize: 10,
      width: 70,
      [theme.breakpoints.up('md')]: {
        fontSize: 12,
        width: '100%',
      }
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logout: {
      display: 'flex',
      alignItems: 'center',
    },
    sizeLogo: {
      width: 100,
      height: 30,
      [theme.breakpoints.up('md')]: {
        width: 180,
        height: 40,
      }
    },
    colorIcon: {
      color: colors.blue,
      fontSize: 30,
    },
    selectLng: {
      marginRight: 30,
      maxHeight: 50
    }
  })
)
