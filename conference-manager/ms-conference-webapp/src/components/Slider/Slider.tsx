import { useState } from 'react'
import { createStyles, makeStyles, Button } from '@material-ui/core'

import LeftArrow from './LeftArrow'
import RightArrow from './RightArrow'
import TimerButton from './TimerButton'
import SlideView from './SlideView'

import { ImageMediaType } from '../../shared/entities'
import { CustomSlideDirection } from './types'

import { colors } from '../../styles/theme/colors'

const useStyles = makeStyles(() =>
  createStyles({
    slider: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.dark,
    },
    sliderWrapper: {
      width: '100%',
      height: '100%',
      position: 'relative',
      top: 0,
    },
    debugDiv: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    formButton: {
      position: 'absolute',
      width: '9em',
      bottom: '2.5em',
      right: '4em',
      padding: '0.5em',
      zIndex: 2,
    },
  })
)

export interface SliderProps {
  images: ImageMediaType[]
  startPaused: boolean
  onFormClicked: () => void
}

export default function Slider({
  images,
  startPaused,
  onFormClicked,
}: SliderProps): JSX.Element {
  // const images = props.images.map((image) => {
  //   return { url: image.url, translateX: 0 }
  // })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<CustomSlideDirection>('left')
  const [showButtons, setShowButtons] = useState(startPaused)

  const classes = useStyles()

  const handleMovePreviousClicked = () => {
    if (currentIndex === 0) {
      setCurrentIndex(images.length - 1)
      setDirection('right')
      return
    }

    setCurrentIndex(currentIndex - 1)
    setDirection('right')
  }

  const handleMoveNextClicked = () => {
    if (images.length - 1 === currentIndex) {
      setCurrentIndex(0)
      setDirection('left')
      return
    }

    setCurrentIndex(currentIndex + 1)
    setDirection('left')
  }

  const handlePlayPauseClicked = () => {
    setShowButtons(!showButtons)
  }

  return (
    <div className={classes.slider}>
      <SlideView
        images={images}
        currentIndex={currentIndex}
        direction={direction}
      />
      <Button
        key="form-button"
        className={classes.formButton}
        variant="contained"
        color="primary"
        size="large"
        onClick={onFormClicked}
      >
        Registrate
      </Button>
      {showButtons && (
        <>
          <LeftArrow key="left" onClick={handleMovePreviousClicked} />
          <RightArrow key="right" onClick={handleMoveNextClicked} />
        </>
      )}
      <TimerButton
        startPaused={startPaused}
        time={8000}
        onClick={handlePlayPauseClicked}
        onTimer={handleMoveNextClicked}
      />
    </div>
  )
}
