import { createStyles, makeStyles } from '@material-ui/core'
import { colors } from "../../styles/theme/colors";

export const mainStyles = makeStyles(() =>
  createStyles({
    mainContainer: {
      boxShadow: 'none',
      backgroundColor: colors.transparentBlue,
      height: '100vh',
      width: '100%',
    },
    innerContainer: {
      backgroundColor: colors.transparentBlue,
    },
  })
)
