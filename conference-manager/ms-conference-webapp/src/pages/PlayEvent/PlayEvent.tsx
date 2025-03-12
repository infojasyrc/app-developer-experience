import { useContext, useEffect } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { Button } from '@material-ui/core'

import LayoutContext, { LayoutTypes } from '../../shared/contexts/LayoutContext'

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    exitButton: {
      position: 'absolute',
      width: '90%',
      top: 0,
      left: '5%',
      height: '3em',
      zIndex: 3,
      border: '1px solid #f00',
    },
  })
)

export default function PlayEventPage(): JSX.Element {
  const classes = useStyles()
  const { changeLayout } = useContext(LayoutContext)

  useEffect(() => {
    changeLayout(LayoutTypes.NONE, '', false)
  })

  const handleBack = () => {
    // eslint-disable-next-line no-console
    console.log('handle back')
  }

  return (
    <>
      <Button className={classes.exitButton} onClick={handleBack}>
        {''}
      </Button>
    </>
  )
}
