import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery, Paper, MobileStepper, Button } from '@mui/material'
import { KeyboardArrowLeft } from '@material-ui/icons'
import { KeyboardArrowRight } from '@material-ui/icons'
import { Box, Grid } from '@material-ui/core'
import { carouselStyles } from './CarouselStyle'
import { CarouselEnum } from '../../shared/constants/constants'


export interface CarouselProps {
  items: { img: string; title: string }[]
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const classes = carouselStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState<number>(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <Paper className={classes.carouselContainer}>
      {isMobile ? (
        <>
          <Box className={classes.innerContainer}>
            {items.map(({img, title}, index) => (
                <img
                  key={index}
                  src={img}
                  alt={title}
                  className={classes.img}
                />
              ))}
          </Box>
          <MobileStepper
            variant="dots"
            steps={items.length}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === items.length - 1}
              >
                Next{' '}
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
          />
        </>
      ) : (
        <Box className={classes.innerContainer}>
          <Grid className="desktopButtonContainer">
            <Button
              size="medium"
              onClick={handleBack}
              disabled={activeStep === 0}
              data-testid="desktop-arrow-left-button"
            >
              <KeyboardArrowLeft />
            </Button>
          </Grid>
          <Box className={classes.imagesDesktopContainer}>
            {items.map(({img, title}, index) => (
                <img
                  key={index}
                  src={img}
                  alt={title}
                  style={{
                    width: `${100 / CarouselEnum.MAX_DESKTOP_STEPS}%`,
                  }}
                  className={classes.carouselImage}
                  data-testid="carousel-image"
                />
              ))}
          </Box>
          <Grid className="desktopButtonContainer">
            <Button
              size="medium"
              onClick={handleNext}
              disabled={activeStep === items.length - CarouselEnum.MAX_DESKTOP_STEPS}
              data-testid="desktop-arrow-right-button"
            >
              <KeyboardArrowRight />
            </Button>
          </Grid>
        </Box>
      )}
    </Paper>
  )
}

export default Carousel
