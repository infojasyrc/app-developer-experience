import { requests } from '../baseRequest'

enum APIEndpoints {
  events = 'events',
  event = 'event',
  users = 'users',
}

function Events() {
  const getAll = async (
    year: string,
    headquarterId: string,
    showAll: string
  ) => {
    const response = await requests.get(
      `${APIEndpoints.events}/${year}/${headquarterId}/${showAll}`
    )
    return response.data.data
  }

  const getAllEventsAuth = async () => {
    const { data } =  await requests.get(`${APIEndpoints.events}`)  
    return data.data
  }

  const getAllWithAttendees = async (year: string) => {
    const response = await requests.get(
      `${APIEndpoints.events}/${year}/with-attendees`
    )
    return response.data.data
  }

  const getById = async (id: string) => {
    const response = await requests.get(`${APIEndpoints.events}/${id}`)
    return response.data.data
  }

  const verifyUserEventSubscribed = async (id: string) => {
    const { data } = await requests.get(`${APIEndpoints.users}/${APIEndpoints.event}/${id}`)
    return data.data
  }

  const add = async (event: any) => await requests.post(APIEndpoints.events, event)

  const update = (id: string, event: any) =>
    requests.put(`${APIEndpoints.events}/${id}`, event)

  const updateImages = (id: string, images: any) => {
    return requests.put(`${APIEndpoints.event}/${id}/images`, { images: images })
  }

  const deleteEvent = async (id: string) =>
    await requests.deleteEndpoint(`${APIEndpoints.events}/${id}`)

  const deleteImage = (id: string, idImage: string) => {
    return requests.deleteEndpoint(`${APIEndpoints.event}/${id}/${idImage}`)
  }

  const open = (id: string) => {
    return requests.put(`${APIEndpoints.event}/${id}`, {status: 'open'})
  }

  const pause = (id: string) => {
    return requests.put(`${APIEndpoints.event}/${id}`, {status: 'pause'})
  }

  const close = (id: string) => {
    return requests.put(`${APIEndpoints.event}/${id}`, {status: 'close'})
  }

  const addAttendees = (id: string, attendees: any) => {
    return requests.put(`${APIEndpoints.events}/${id}/attendees`, {
      attendees: attendees,
    })
  }

  return {
    getAll,
    getAllEventsAuth,
    getAllWithAttendees,
    verifyUserEventSubscribed,
    getById,
    add,
    update,
    updateImages,
    deleteEvent,
    deleteImage,
    open,
    pause,
    close,
    addAttendees,
  }
}

export default Events
