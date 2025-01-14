import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { CreateEventDto, EventStatus } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'
import { AddAttendeeToEventDto } from './dto/add-attendee-to-event.dto'
import { EventIdDto } from './dto/event-id.dto'
import { UserIdDto } from './dto/user-id.dto'
import { Event } from './event.entity'
import EventMapper from './event.mapper'
import { EventResponse } from './interfaces/event-response'
import { ChupitosNotFoundException } from '../../exceptions/chupitos-not-found.exception'
import { ChupitosBadRequestException } from '../../exceptions/chupitos-bad-request'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    private logger: Logger,
    private readonly firebaseUploadService: FirebaseUploadService
  ) {}

  async create(eventDto: CreateEventDto): Promise<EventResponse> {
    this.logger.log('Create event service')

    const event = EventMapper.createEventMapper(eventDto)
    await this.validateEventNameAlreadyExisting(event)
    if (eventDto.image) {
      this.validateEventImage(eventDto.image)
      await this.getFirebaseUploadedImageUrl(eventDto.image, event)
    }
    return await this.eventModel.create(event)
  }

  async getFirebaseUploadedImageUrl(file: Express.Multer.File, event: Event): Promise<Event> {
    try {
      const url = await this.firebaseUploadService.uploadFile(file)
      event.images = [url]
      return event
    } catch (error) {
      this.logger.error('Error at event service, get firebase uploaded image url', error)
    }
  }

  validateEventImage(image: Express.Multer.File): void {
    if (!image.mimetype.startsWith('image/jpeg')) {
      throw new ChupitosBadRequestException('Only JPG images are allowed')
    }
    return
  }

  async validateEventNameAlreadyExisting(event: Event): Promise<void> {
    const verificationEvent = await this.eventModel.findOne({ name: event.name })
    if (verificationEvent)
      throw new ChupitosBadRequestException(`The event with name: ${event.name}, already exist`)
    return
  }

  async update(id: EventIdDto, event: UpdateEventDto): Promise<EventResponse> {
    this.logger.log('Update event service')
    const mappedEvent = EventMapper.updateEventMapper(event)
    const updatedEvent = await this.eventModel
      .findOneAndUpdate({ _id: id }, mappedEvent, { new: true })
      .exec()
    if (!updatedEvent)
      throw new ChupitosNotFoundException(`Error at update event service, _id: ${id} was not found`)
    return updatedEvent
  }

  async getAll(params: RequestGetAllEventsDto): Promise<EventResponse[]> {
    this.logger.log('Get all events service')
    const query = EventMapper.getAllEventsMapper(params)

    const result = await this.eventModel.find(query).exec()
    return result
  }

  async addAttendeeToEvent(
    eventId: EventIdDto,
    userId: UserIdDto,
    attendeeData: AddAttendeeToEventDto
  ): Promise<EventResponse> {
    this.logger.log(`Add attendee ${userId} to event id: ${eventId} at service`)

    const event = await this.eventModel.findById(eventId)
    if (!event)
      throw new ChupitosNotFoundException(
        `Error at add attendee to event service, event _id: ${eventId} was not found`
      )

    this.validateEventStatus(eventId, event)
    this.validateUserAttendingEvent(event, eventId, userId)

    event.attendees.push(new Types.ObjectId(String(userId)))
    return event.save()
  }

  private validateEventStatus(eventId: EventIdDto, event: Event) {
    if (event.status !== EventStatus.ACTIVE) {
      throw new ChupitosBadRequestException(
        `Event with id: ${eventId} cannot accept attendees because is not active`
      )
    }
  }

  private validateUserAttendingEvent(event: Event, eventId: EventIdDto, userId: UserIdDto) {
    if (event.attendees.includes(new Types.ObjectId(String(userId)))) {
      throw new ChupitosBadRequestException(
        `User with id: ${userId} is already attending event: ${eventId}`
      )
    }
  }

  async getById(eventId: EventIdDto): Promise<EventResponse> {
    this.logger.log(`Get event with id: ${eventId} service`)
    const getEvent = await this.eventModel.findById(eventId)

    if (!getEvent)
      throw new ChupitosNotFoundException(
        `Error at get event by id service, _id: ${eventId} was not found`
      )

    return getEvent
  }
}
