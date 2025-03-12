import { Button, createStyles, makeStyles } from '@material-ui/core'
import RightIcon from '@material-ui/icons/KeyboardArrowRight'

const useStyles = makeStyles(() =>
  createStyles({
    rightArrow: {
      position: 'absolute',
      top: '2.5%',
      right: '0.5em',
      height: '95%',
      zIndex: 2,
    },
  })
)

export interface RightArrowProps {
  onClick: () => void
}

export default function RightArrow({ onClick }: RightArrowProps): JSX.Element {
  const classes = useStyles()

  return (
    <Button
      className={classes.rightArrow}
      onClick={onClick}
      data-testId="btnSliderRight"
    >
      <RightIcon fontSize="large" />
    </Button>
  )
}
