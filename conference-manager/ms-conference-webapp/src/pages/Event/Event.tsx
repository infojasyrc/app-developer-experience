import { useHistory } from 'react-router-dom'

import EventView from '../../components/EventView/EventView'
import EventsApi from '../../shared/api/endpoints/events'

 //TODO: Get info from database (not provided)
import { mockTags } from '../../mocks/tags'
//TODO: Get info from database (not provided)
import { mockHeadquarters } from '../../mocks/headquarter'
import { Conference } from '../../shared/entities'

export default function EventPage(): JSX.Element {
  const newEvent: Conference = {
    _id: '',
    name: '',
    eventDate: '',
    address: '',
    eventType: '',
    description: '',
    tags: [],
    phoneNumber: '',
    status: 'active',
  }
  const history = useHistory()

  const handleCancelButton = () => {
    history.push('/events/list')
  }


  const handleSubmitButton = async (newEvent: Conference) => {
    const api = EventsApi()
    try {
      await api.add(newEvent).then(
        () => handleCancelButton()
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <EventView
      eventData={newEvent}
      headquarters={mockHeadquarters}
      tags={mockTags}
      isLoading={false}
      validation={{
        name: { error: false, message: '' },
        eventDate: { error: false, message: '' },
      }}
      onSubmit={handleSubmitButton}
      onCancel={handleCancelButton}
    />
  )
}
