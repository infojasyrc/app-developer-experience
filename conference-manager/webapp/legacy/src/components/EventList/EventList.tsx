import { createStyles, makeStyles } from '@material-ui/styles'

import EventCard from '../EventCard/EventCard'
import { Conference } from '../../shared/entities'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles(() =>
  createStyles({
    noResults: {
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: '3em',
    },
  }),
)

export type EventListProps = {
  events: Conference[]
}

export default function EventList({ events }: EventListProps): JSX.Element {
  const classes = useStyles()
  const { t } = useTranslation('global')

  if (!events || events.length === 0) {
    return <h4 className={classes.noResults}>{t('home.nothing_data')}</h4>
  }

  return (
    <>
      {events.map((event, index) => (
        <EventCard event={event} key={index} />
      ))}
    </>
  )
}
