import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import EventEditView from '../../components/EventEditView/EventEditView'
import EventsApi from '../../shared/api/endpoints/events'

//TODO: Get info from database (not provided)
import { mockHeadquarters } from '../../mocks/headquarter'
import { Conference } from '../../shared/entities'


export default function EventEditPage(): JSX.Element {
  const [eventData, setEventData] = useState({} as Conference)
  const history = useHistory()
  const { id } = useParams<Record<string, string | undefined>>()

  const redirectButton = () => {
    history.push('/events/list')
  }

  const handleSubmitButton = async () => {
    const api = EventsApi()
    try {
      const data = await api.update(eventData._id, eventData)

      if (data.status) redirectButton()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  useEffect(() => {
    if (id) fetchEventById(id)
  }, [id])

  const fetchEventById = async (eventId: string) => {
    const api = EventsApi()
    try {
      const resultData: Conference = await api.getById(eventId)

      setEventData(resultData)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <EventEditView
      headquarters={mockHeadquarters}
      isLoading={false}
      eventData={eventData}
      validation={{
        name: { error: false, message: '' },
        eventDate: { error: false, message: '' },
      }}
      onSubmit={handleSubmitButton}
      onBack={redirectButton}
    />
  )
}
