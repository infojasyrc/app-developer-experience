import { createStyles, Button, makeStyles } from '@material-ui/core'

import Slider from '../Slider/Slider'

import { Conference } from '../../shared/entities'

const useStyles = makeStyles(() =>
  createStyles({
    exitButton: {
      position: 'absolute',
      width: '90%',
      top: 0,
      left: '5%',
      height: '3em',
      zIndex: 3,
    },
  })
)

export interface PlayEventViewProps {
  event: Conference
  onFormClicked: () => void
  onBackClicked: () => void
}

export default function PlayEventView({
  event,
  onFormClicked,
  onBackClicked,
}: PlayEventViewProps): JSX.Element {
  const classes = useStyles()

  return (
    <>
      <Slider
        images={event?.images || []}
        startPaused={false}
        onFormClicked={onFormClicked}
      />
      <Button className={classes.exitButton} onClick={onBackClicked}>
        {''}
      </Button>
    </>
  )
}
