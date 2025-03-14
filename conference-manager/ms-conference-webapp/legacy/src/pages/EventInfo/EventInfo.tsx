import { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth';
import EventsApi from '../../shared/api/endpoints/events';
import EventDetails from '../../components/EventDetails/EventDetails';
import SkeletonEventDetails from '../../components/SkeletonEvents/SkeletonEventDetails';

export interface EventInfoPageProps {
  name: string
  id: string
  eventDate: string
  status: string
  description: string
  tags: string
  type: string
}

export default function EventInfoPage(): JSX.Element {
  const history = useHistory()
  const { id } = useParams<{ id: string }>() as { id: string }
  const [loading, setLoading] = useState(false)

  const [eventDetails, setEventDetails] = useState<EventInfoPageProps>({
    id: '',
    name: '',
    eventDate: '',
    status: '',
    description: '',
    tags: '',
    type: '',
  })
  const  { isAuth } = useAuth()

  const subscribedValidationHandler = () => {
    history.push(`${isAuth ? `/event-info/${id}` : `/login?eventId=${id}`}`)
  }

  const goBack = () => window.history.back();

  const fetchEventDetails = async (eventId: string) => {
    setLoading(true)
    try {
      const eventResponse = await EventsApi().getById(eventId).then();
      setEventDetails(eventResponse);
      setLoading(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching event or subscription data:", error);
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEventDetails(id)
    }
  }, [id])

  if (loading) {
    return <SkeletonEventDetails />
  }

  return (
    <EventDetails
      eventDetails={eventDetails}
      subscribedValidationHandler={subscribedValidationHandler}
      goBack={goBack}
    />
  )
}
