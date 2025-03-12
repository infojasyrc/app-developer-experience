import { createStyles, makeStyles, CircularProgress } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      position: 'fixed',
      height: '78%',
      width: '94%',
    },
    waiting: {
      position: 'relative',
      top: '46%',
      left: '46%',
    },
  })
)

export interface LoadingProps {
  isLoading: boolean
}

export default function Loading({ isLoading }: LoadingProps): JSX.Element {
  const classes = useStyles()

  if (!isLoading) {
    return <></>
  }

  return (
    <div className={classes.container} data-testid="loader">
      <CircularProgress className={classes.waiting} size={100} />
    </div>
  )
}
