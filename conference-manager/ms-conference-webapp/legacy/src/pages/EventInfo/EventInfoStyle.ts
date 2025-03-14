import { createStyles, makeStyles } from "@material-ui/core";
import { colors } from "../../shared/themes/colors";

export const eventInfoStyles = makeStyles((theme) =>
  createStyles({
    titleContainer: {
      background: colors.white,
      paddingTop: theme.spacing(13),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      backgroundColor: colors.lightBlue,
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
        paddingTop: theme.spacing(13),
      },
    },
    eventInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'column',
      color: colors.dark,
      height: 130,
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'space-evenly',
       },
    },
    date: {
      fontSize: '1em',
      color: colors.darkGray,
      paddingBottom: theme.spacing(2),
      marginLeft: '1em',
    },
    button: {
      borderColor: colors.darkerBlue,
      color: colors.darkerBlue,
      fontWeight: 600,
      [theme.breakpoints.down('xs')]: {
        fontSize: 11,
      },
    },
    btnBack:{
      color: colors.darkerBlue,
    },
    statebtn: {
      color: colors.white,
      backgroundColor: colors.mainBlue,
      fontWeight: "bold",
      textTransform: 'capitalize',
      borderRadius: 5,
      padding: 5,
      [theme.breakpoints.down('xs')]: {
        fontSize: 12,
       },
    },
    body: {
      background: colors.white,
      padding: theme.spacing(3),
      backgroundColor: colors.lightBlue,
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
      },
    },
    description: {
      marginLeft: '1em',
    },
    subscribersSection: {
      display: 'flex',
      marginTop: theme.spacing(5),
    },
    boldPinkColor: {
      color: colors.white,
      backgroundColor: colors.boldPink,
    },
    subscribedUserIcon: {
      color: colors.white,
      backgroundColor: colors.pink,
      right: 20,
    },
    text: {
      color: colors.mainBlue,
      marginTop: '0.5em',
      marginBottom: '2em',
      fontWeight: "bold",
      marginLeft: "-15px",
    },
    pinkColor: {
      color: colors.white,
      backgroundColor: colors.darkPink,
      fontWeight: 'bold',
    },
    month: {
      color: colors.darkerBlue,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: 20,
      [theme.breakpoints.down('xs')]: {
        fontSize: 11,
       },
    },
    day: {
      color: colors.black,
      fontWeight: 'bold',
      fontSize: 36,
      [theme.breakpoints.down('xs')]: {
       fontSize: 20,
      },
    },
    year: {
      color: colors.boldGray,
      fontWeight: 'bold',
      fontSize: 20,
      [theme.breakpoints.down('xs')]: {
        fontSize: 11,
       },
    },
    position: {
      right: 12,
      bottom: 30,
    },
    columns: {
      width: '50px',
      [theme.breakpoints.up('sm')]: {
        width: '100px',
      },
    },
    skeletonBody: {
     paddingTop: theme.spacing(13),
     padding: theme.spacing(3),
    },
    space:{
      marginTop: theme.spacing(9)
    }
  })
)
