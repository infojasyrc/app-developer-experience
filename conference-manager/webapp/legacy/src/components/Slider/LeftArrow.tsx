import { Button, createStyles, makeStyles } from '@material-ui/core'
import LeftIcon from '@material-ui/icons/KeyboardArrowLeft'

const useStyles = makeStyles(() =>
  createStyles({
    leftArrow: {
      position: 'absolute',
      top: '2.5%',
      left: '0.5em',
      height: '95%',
      zIndex: 2,
    },
  })
)

export interface LeftArrowProps {
  onClick: () => void
}

export default function LeftArrow({ onClick }: LeftArrowProps): JSX.Element {
  const classes = useStyles()

  return (
    <Button
      className={classes.leftArrow}
      onClick={onClick}
      data-testId="btnSliderLeft"
    >
      <LeftIcon fontSize="large" />
    </Button>
  )
}
