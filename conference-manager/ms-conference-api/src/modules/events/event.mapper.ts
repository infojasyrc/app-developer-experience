import { Injectable } from '@nestjs/common'
import { CreateEventDto, EventStatus } from './dto/create-event.dto'
import { Event } from './event.entity'
import { UpdateEventDto } from './dto/update-event.dto'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'
import { QueryGetAllEventsInterface } from './interfaces/get-all-events.interface'

@Injectable()
export default class EventMapper {
  public static createEventMapper(eventDto: CreateEventDto): Event {
    const { eventDate, userId, ...restEvent } = eventDto
    const eventDateToCreate = new Date(eventDate)
    const event: Event = {
      year: eventDateToCreate.getFullYear().toString(),
      eventDate: eventDateToCreate,
      status: EventStatus.CREATED,
      owner: userId,
      ...restEvent,
    }

    return event
  }

  public static updateEventMapper(event: UpdateEventDto): Partial<Event> {
    if (event.eventDate) {
      event.eventDate = new Date(event.eventDate)
      event.year = event.eventDate.getFullYear().toString()
    }
    return event
  }

  public static getAllEventsMapper(
    responseGetAll: RequestGetAllEventsDto
  ): QueryGetAllEventsInterface {
    const { isAdmin, userId, ...filters} = responseGetAll
    return isAdmin
      ? { owner: userId, ...filters }
      : {
          status: EventStatus.ACTIVE,
          ...filters,
        }
  }
}
