import { createStyles, makeStyles } from '@material-ui/core'
import { colors } from '../themes/colors'

export const eventStyle = makeStyles((theme) =>
  createStyles({
    disabled: {
      pointerEvents: 'none',
    },
    container: {
      flexFlow: 'column',
      textAlign: 'center',
      margin: '10px auto',
      boxShadow: `0px 0px 12px ${colors.shadowGray}`,
      padding: '20px',
      [theme.breakpoints.up('xs')]: {
        width: '98%',
        boxShadow: `0px 0px 4px ${colors.shadowGray}`,
        margin: '2px auto',
      }
    },
    textField: {
      width: '100%',
    },
    contentButton: {
      display: 'flex',
      justifyContent: 'space-evenly',
      margin: '25px 0px',
    },
    table: {
      marginBottom: '2em',
    },
    headquarterFilter: {
      marginBottom: '2em',
      paddingBottom: '20px',
      boxShadow: `0px 1px 1px ${colors.mediumGray}`,
      justifyContent: 'space-around',
    },
    centeredContent: {
      justifyContent: 'center',
    },
    noResults: {
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: '3em',
    },
  })
)
