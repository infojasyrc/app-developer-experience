import { createStyles, makeStyles } from '@material-ui/core'

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

export interface CustomSlideProps {
  image: string
  isEntering: boolean
}

export default function CustomSlide({ image, isEntering }: CustomSlideProps): JSX.Element {
  const classes = useStyles()

  const slideStyle = {
    backgroundImage: `url(${image})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50% 60%',
    zIndex: isEntering ? 1 : 0,
  }

  return (
    <div className={classes.slide} style={slideStyle} data-id="slide"></div>
  )
}
