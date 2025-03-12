import { createStyles, makeStyles } from '@material-ui/core'

export const carouselStyles = makeStyles((theme) =>
  createStyles({
    carouselContainer: {
      marginTop: '24px',
      overflow: 'hidden',
      position: 'relative',
    },
    innerContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
        overflow: 'hidden',
      },
    },
    imagesDesktopContainer: {
      display: 'flex',
      width: '100%',
      transition: 'transform 0.3s ease-in-out',
    },

    carouselImage: {
      height: '197px', 
      padding: '1px',
      boxSizing: 'border-box',
    },
    desktopButtonContainer:{
      display: 'grid',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '100%',
      zIndex: 1,
    },
    img: {
        width: '100%',
        maxHeight: 400,
        objectFit: 'cover',
        padding: '10px',
    }
  })
)
