import { useHistory } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import { colors } from '../../styles/theme/colors'

const useStyles = makeStyles(() =>
  createStyles({
    title: {},
    arrowBackIcon: {
      color: colors.white,
    },
    logo: {
      position: 'sticky',
      left: '46%',
      height: '2.5em',
    },
  })
)

export interface NavigationBarProps {
  title: string
  showLogo: boolean
}

export default function NavigationBar({
  title,
  showLogo,
}: NavigationBarProps): JSX.Element {
  const classes = useStyles()
  const history = useHistory()

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    history.goBack()
  }

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            aria-label="Back"
            data-testid="navigation-back-button"
            onClick={handleBackClick}
          >
            <ArrowBackIcon className={classes.arrowBackIcon} />
          </IconButton>
          <Typography className={classes.title} variant="h5">
            {title}
          </Typography>
          {showLogo && (
            <img
              className={classes.logo}
              data-testid="navigation-logo-img"
              src="/assets/chupito-logo.svg"
              alt="Chupito events logo"
            />
          )}
        </Toolbar>
      </AppBar>
    </>
  )
}
