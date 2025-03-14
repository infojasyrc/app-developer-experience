import { useState, useContext, useEffect } from 'react'

import UserContext from '../../shared/contexts/UserContext'
import EventsView from '../../components/EventsView/EventsView'
import { HeadquartersAPI, ConferenceAPI } from '../../shared/api'
import { Conference, Headquarter } from '../../shared/entities'
import { sortAscending } from '../../shared/tools/sorting'
import { AuthContext } from '../../shared/contexts/Auth/AuthContext'
import Events from '../../shared/api/endpoints/events'
import { useTranslation } from 'react-i18next'

export default function EventsPage(): JSX.Element {
  const [allHeadquarters, setAllHeadquarters] = useState<Headquarter[]>([])
  const [events, setEvents] = useState<Conference[]>([])
  const [loadingHeadquarters, setLoadingHeadquarters] = useState(false)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('global')

  const apiHeadquarters = HeadquartersAPI()
  const apiConferences = ConferenceAPI()
  const apiEvents = Events()

  const { user } = useContext(UserContext)
  const { isAuth } = useContext(AuthContext)

  const fetchHeadquarters = () => {
    setLoadingHeadquarters(true)
    apiHeadquarters
      .getAll()
      .then((headquarters) => {
        setAllHeadquarters(headquarters)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(
          'Error retrieving all headquarters: ',
          JSON.stringify(error),
        )
      })
      .finally(() => {
        setLoadingHeadquarters(false)
      })
  }

  const sortByDate = (events: Conference[]) => events.sort(sortAscending)

  const fetchEvents = () => {
    setLoading(true)

    apiConferences
      .getAll()
      .then((events) => {
        setEvents(sortByDate(events))
      })
      .catch((error) => {
        setLoading(false)
        // eslint-disable-next-line no-console
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  const fetchEventsAuth = async () => {
    setLoading(true)
    try {
      //TODO: Replace when endpoint get all events from auth user is ready
      const events = await apiEvents.getAllEventsAuth()
      setEvents(sortByDate(events))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeadquarters()
    if (isAuth) {
      fetchEventsAuth()
    } else {
      fetchEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth])

  if (loading) {
    return <>{t('events.load_events')}</>
  }

  return (
    <>
      {!loading && (
        <EventsView
          events={events}
          allHeadquarters={allHeadquarters}
          loadingEvents={loading}
          loadingHeadquarters={loadingHeadquarters}
          isAdmin={user?.isAdmin || false}
        />
      )}
    </>
  )
}
