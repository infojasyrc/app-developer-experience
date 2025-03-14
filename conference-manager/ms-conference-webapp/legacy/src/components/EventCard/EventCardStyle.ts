import { createStyles, makeStyles } from '@material-ui/core'
import { colors } from '../../shared/themes/colors'

export const eventCardStyles = makeStyles((theme) =>
  createStyles({
    card: {
      display: 'flex',
      border: '1px solid #ccc',
      borderRadius: '18px',
      width: '325px',
      marginBottom: '10px',
      [theme.breakpoints.up('sm')]: {
        width: '450px',
        heigth: '200px',
        marginRight: '20px',
      },
    },
    cardImage: {
      height: '150px',
      objectFit: 'cover',
      borderRadius: '0.2em 0.2em 0 0',
      [theme.breakpoints.up('sm')]: {
        height: '250px',
      },
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      height: '100px',
      [theme.breakpoints.up('sm')]: {
        flex: '1',
      },
    },
    button: {
      color: colors.darkerBlue,
      height: '40px',
      '&.MuiButton-outlined': {
        borderWidth: '2px',
        borderColor: colors.mainBlue,
      },
      [theme.breakpoints.up('sm')]: {
        height: '50px',
        width: '100px',
      },
    },
    day: {
      color: colors.darkerBlue,
      fontWeight: 'bold',
    },
    month: {
      color: colors.black,
      fontWeight: 'bold',
    },
    year: {
      color: colors.boldGray,
      fontWeight: 'bold',
    },
    eventTitle: {
      overflow: "hidden", 
      textOverflow: "ellipsis", 
      width: '130px',
      fontSize: '18px',
      [theme.breakpoints.up('sm')]: {
        fontSize: '30px',
        width: '230px',
      },
    },
    columns: {
      width: '50px',
      [theme.breakpoints.up('sm')]: {
        width: '100px',
      },
    },
    mainColumn: {
      width: '140px',
      [theme.breakpoints.up('sm')]: {
        width: '400px',
      },
    },
    link: {
      color: colors.mainBlue,
      marginTop: '5px',
      fontSize: '15px',
      [theme.breakpoints.up('sm')]: {
        fontSize: '20px',
        marginBottom: '5px',
      },
    },
    subscribersSection: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
    },
    subscribedAvatar: {
      backgroundColor: colors.white,
      width: '35px',
      height: '35px',
      [theme.breakpoints.up('sm')]: {
        height: '30px',
      },
    },
    subscribedAddIcon: {
      backgroundColor: colors.pink,
      right: '12px',
      width: theme.spacing(4),
      height: theme.spacing(4),
    },

    subscribersNumber: {
      fontSize: '10px',
      textAlign: 'center',
      color: colors.white,
    },
    joinedText: {
      color: colors.black,
    },
    joinedTextBox: {
      marginRight: '16px',
    },
  })
)
