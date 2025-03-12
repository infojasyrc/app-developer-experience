import { useEffect, useState } from 'react'
import AddIcon from '@material-ui/icons/Add'
import { useHistory } from 'react-router-dom'
import { Fab } from '@material-ui/core'

import EventAdminView from '../../components/EventsAdminView/EventAdminView'
import {
  Conference,
  ConferenceStatus,
  Headquarter,
} from '../../shared/entities'
import { ConferenceAPI, HeadquartersAPI } from '../../shared/api'
import { sortAscending } from '../../shared/tools/sorting'

export default function EventsAdminPage(): JSX.Element {
  const [allHeadquarters, setAllHeadquarters] = useState<Headquarter[]>([])
  const [events, setEvents] = useState<Conference[]>([])
  const [loadingHeadquarters, setLoadingHeadquarters] = useState(false)
  const [loading, setLoading] = useState(true)

  const apiHeadquarters = HeadquartersAPI()
  const apiConferences = ConferenceAPI()

  const fetchHeadquarters = async () => {
    try {
      setAllHeadquarters(await apiHeadquarters.getAll())
      setLoadingHeadquarters(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  const sortByDate = (events: Conference[]) => events.sort(sortAscending)

  const fetchEvents = async () => {
    setEvents(sortByDate(await apiConferences.getAll()))
    setLoading(false)
  }

  const history = useHistory()

  const handleLinkAddEvent = () => {
    history.push(`/event/add`)
  }

  const updateEvents = (id: string | undefined) => {
    setEvents(sortByDate(events.filter((x: Conference) => x._id !== id)))
  }

  const updateStatusEvents = (
    id: string | undefined,
    status: ConferenceStatus
  ) => {
    setEvents(
      events.map((event: Conference) => {
        if (event._id === id) event.status = status
        return event
      })
    )
  }

  useEffect(() => {
    fetchHeadquarters()
    fetchEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div>
        <EventAdminView
          events={events}
          allHeadquarters={allHeadquarters}
          loadingEvents={loading}
          loadingHeadquarters={loadingHeadquarters}
          updateEvents={updateEvents}
          updateStatusEvents={updateStatusEvents}
        />

        <Fab
          color="primary"
          onClick={handleLinkAddEvent}
          data-testid="add-event"
        >
          <AddIcon />
        </Fab>
      </div>
    </>
  )
}
