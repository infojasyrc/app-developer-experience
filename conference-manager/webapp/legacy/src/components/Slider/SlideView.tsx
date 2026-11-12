import { Slide } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core'

import CustomSlide from './CustomSlide'

import { ImageMediaType } from '../../shared/entities'
import { CustomSlideDirection } from './types'

const useStyles = makeStyles(() =>
  createStyles({
    slide: {
      width: '100%',
      height: '100%',
      top: 0,
      position: 'absolute',
    },
  })
)

export interface SlideViewProps {
  images: ImageMediaType[]
  currentIndex: number
  direction: CustomSlideDirection
}

export default function SlideView({
  images,
  currentIndex,
  direction,
}: SlideViewProps): JSX.Element {
  const classes = useStyles()

  const getSlideStyle = (image: string, isEntering: boolean) => {
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '50% 60%',
      zIndex: isEntering ? 1 : 0,
    }
  }

  const components = images.map((image, index) => {
    if (index === currentIndex) {
      return (
        <Slide key={index} direction={direction} in={true} timeout={500}>
          <div
            style={getSlideStyle(image.url, true)}
            className={classes.slide}
          />
        </Slide>
      )
    }

    if (direction === 'left') {
      if (currentIndex === 0 && index === images.length - 1) {
        return <CustomSlide key={index} image={image.url} isEntering={false} />
      }

      if (index + 1 === currentIndex) {
        return <CustomSlide key={index} image={image.url} isEntering={false} />
      }
    }

    if (direction === 'right') {
      if (index === 0 && currentIndex === images.length - 1) {
        return <CustomSlide key={index} image={image.url} isEntering={false} />
      }

      if (currentIndex + 1 === index) {
        return <CustomSlide key={index} image={image.url} isEntering={false} />
      }
    }

    return <></>
  })

  return <div data-testid="slider-section">{components}</div>
}
