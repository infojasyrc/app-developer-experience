import { createStyles, makeStyles } from '@material-ui/core'
import { colors } from '../themes/colors'

export const customButton = {
  width: '100%',
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'center',
};

export const loginStyle = makeStyles((theme) =>
  createStyles({
    container: {
      [theme.breakpoints.up('md')]: {
        marginLeft: '50px',
        marginRight: '50px',
      },
    },
    loginBoxContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      paddingTop: '15%',
      [theme.breakpoints.up('md')]: {
        paddingTop: '2%',
      },
    },
    input: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '15px',
      marginTop: '15px',
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'gray',
          borderRadius: '12px',
          height: '60px',
        },
      },
      [theme.breakpoints.up('md')]: {
        marginBottom: '20px',
        marginTop: '20px',
      },
    },
    icons: {
      color: colors.gray,
    },
    button: {
      marginTop: '20px',
      backgroundColor: colors.mainBlue,
      color: colors.white,
      fontFamily: 'Exo',
      borderRadius: '8px',
      padding: '12px',
      '&.MuiButton-root.Mui-disabled': {
        backgroundColor: colors.disabledButton,
      },
    },
    googleButtonContainer: {
      marginTop: '20px',
      width: '100%',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '6%',
      paddingBottom: '5%',
      marginBottom: '80px',
      [theme.breakpoints.up('md')]: {
       marginBottom: 0,
      },
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      padding: '20px 30px',
      [theme.breakpoints.up('md')]: {
        width: '450px',
        height: '250px',
        padding: '8% 5%',
      },
    },
  })
)
