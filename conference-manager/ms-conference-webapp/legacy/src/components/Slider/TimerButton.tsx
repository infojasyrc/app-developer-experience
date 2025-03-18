import { useEffect, useState } from 'react'
import { createStyles, IconButton, makeStyles } from '@material-ui/core'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

import { SlideStatus } from '../../shared/entities'

import { colors } from '../../styles/theme/colors'

const useStyles = makeStyles(() =>
  createStyles({
    timerButton: {
      position: 'absolute',
      bottom: '1em',
      left: '47.5%',
      zIndex: 2,
      backgroundColor: colors.transparentBlack,
      color: colors.white,
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: colors.white,
    },
  })
)

export interface TimerButtonProps {
  onClick: () => void
  onTimer: () => void
  time: number
  startPaused?: boolean
}

export default function TimerButton({
  onClick,
  onTimer,
  time,
  startPaused,
}: TimerButtonProps): JSX.Element {
  const [status, setStatus] = useState<SlideStatus>(
    startPaused ? 'stopped' : 'playing'
  )
  const [currentTimer, setCurrentTimer] =
    useState<ReturnType<typeof setInterval>>()

  const classes = useStyles()

  const handlePauseClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    onClick()

    setStatus('paused')
    currentTimer && clearInterval(currentTimer)
  }

  const handlePlayClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    onClick()
    onTimer()

    setStatus('playing')
    setCurrentTimer(setInterval(onTimer, time))
  }

  useEffect(() => {
    if (status !== 'playing') {
      return
    }
    setCurrentTimer(setInterval(onTimer, time))
    // eslint-disable-next-line
  }, [])

  if (status === 'stopped' || status === 'paused') {
    return (
      <IconButton
        className={classes.timerButton}
        onClick={handlePlayClicked}
        data-testid="timer-play-button"
      >
        <PlayIcon fontSize="large" />
      </IconButton>
    )
  }

  return (
    <IconButton
      className={classes.timerButton}
      onClick={handlePauseClicked}
      data-testid="timer-pause-button"
    >
      <PauseIcon fontSize="large" />
    </IconButton>
  )
}

// class TimerButton extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       status: props.startPaused ? 'stopped' : 'playing',
//     }

//     this.timer = null
//   }

//   componentDidMount() {
//     const { status } = this.state

//     if (status !== 'playing') {
//       return
//     }

//     const { onTimer, time } = this.props
//     this.timer = setInterval(onTimer, time)
//   }

//   handlePlayClicked = (e) => {
//     e.preventDefault()

//     const { onTimer, time, onClick } = this.props

//     onClick()
//     onTimer()

//     this.setState({ status: 'playing' })
//     this.timer = setInterval(onTimer, time)
//   }

//   handlePauseClicked = (e) => {
//     e.preventDefault()

//     const { onClick } = this.props

//     onClick()

//     this.setState({ status: 'paused' })
//     clearInterval(this.timer)
//   }

//   render() {
//     const { classes } = this.props
//     const { status } = this.state

//     if (status === 'stopped' || status === 'paused') {
//       return (
//         <IconButton
//           className={classes.timerButton}
//           onClick={this.handlePlayClicked}
//         >
//           <PlayIcon fontSize="large" />
//         </IconButton>
//       )
//     }

//     if (status === 'playing') {
//       return (
//         <IconButton
//           className={classes.timerButton}
//           onClick={this.handlePauseClicked}
//         >
//           <PauseIcon fontSize="large" />
//         </IconButton>
//       )
//     }

//     return null
//   }
// }

// export default withStyles(styles)(TimerButton)
