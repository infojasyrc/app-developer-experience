import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Model, Connection, connect, Types } from 'mongoose'
import { ObjectId } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { EventStatus } from './dto/create-event.dto'
import { BadRequestException } from '../../exceptions/BadRequest'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import {
  EVENT_RESPONSE_MOCK,
  LIST_EVENT_MOCK,
  EVENT_ID_MOCK,
  UPDATE_EVENT_MOCK_DTO,
  ATTENDEE_DATA_MOCK,
  USER_ID_MOCK
} from '../../helpers/mocks/events/event-detail'
import { EventService } from './event.service'
import { Event, EventSchema } from './event.entity'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'

describe.skip('EventService', () => {
  let eventService: EventService
  let logger: Logger

  let eventModel: Model<Event>

  let mongod: MongoMemoryServer
  let mongoConnection: Connection

  beforeAll(async () => {
    await createDBServer()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAdminService,
        FirebaseUploadService,
        EventService,
        Logger,
        { provide: getModelToken(Event.name), useValue: eventModel },
      ],
    }).compile()

    eventService = module.get<EventService>(EventService)
    logger = module.get<Logger>(Logger)
  })

  const createDBServer = async () => {
    mongod = await MongoMemoryServer.create()
    const URI = mongod.getUri()
    mongoConnection = (await connect(URI)).connection
    eventModel = mongoConnection.model(Event.name, EventSchema)
  }

  afterEach(async () => {
    const collections = mongoConnection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  })

  afterAll(async () => {
    try {
      await mongoConnection.dropDatabase()
      await mongoConnection.close()
      await mongod.stop()
    } catch (error) {
      console.log('error', error)
    }
  })

  it('event Service should be defined', () => {
    expect(eventService).toBeDefined()
  })

  it('create event, should return the information of the created event', async () => {
    const eventCreated = await eventModel.create(EVENT_RESPONSE_MOCK)

    const eventSaved = await eventModel.findOne({
      name: 'Storm',
    })

    expect(eventSaved.name).toBe(eventCreated.name)
    expect(eventSaved.eventDate).toEqual(eventCreated.eventDate)
    expect(eventSaved.owner).toBe(eventCreated.owner)
    expect(eventSaved.type).toBe(eventCreated.type)
    expect(eventSaved.tags).toBe(eventCreated.tags)
    expect(String(eventSaved.headquarter)).toBe(String(eventCreated.headquarter))
    expect(eventSaved.description).toBe(eventCreated.description)
    expect(eventSaved.address).toBe(eventCreated.address)
    expect(eventSaved.status).toBe(eventCreated.status)
    expect(eventSaved.year).toBe(eventCreated.year)
  })

  it('get find by id, should return the information about one event ', async () => {
    const eventMock = EVENT_RESPONSE_MOCK

    jest.spyOn(eventModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(eventMock),
    } as any)

    const eventById = await eventModel.findById(EVENT_ID_MOCK).exec()

    expect(eventById?.name).toBe(eventMock.name)
    expect(eventById?.eventDate).toEqual(eventMock.eventDate)
    expect(eventById?.owner).toBe(eventMock.owner)
    expect(eventById?.type).toBe(eventMock.type)
    expect(eventById?.tags).toBe(eventMock.tags)
    expect(eventById?.headquarter).toBe(eventMock.headquarter)
    expect(eventById?.description).toBe(eventMock.description)
    expect(eventById?.address).toBe(eventMock.address)
    expect(eventById?.status).toBe(eventMock.status)
    expect(eventById?.year).toBe(eventMock.year)
  })

  it('update event, should return the information of the updated event', async () => {

    await eventModel.create({ _id: EVENT_ID_MOCK, ...EVENT_RESPONSE_MOCK })
    const updatedEventResponse = await eventService.update(Object(EVENT_ID_MOCK), UPDATE_EVENT_MOCK_DTO)
    const retrievedUpdatedEvent = await eventModel.findById(EVENT_ID_MOCK)

    expect(updatedEventResponse).toBeDefined()
    expect(updatedEventResponse).toEqual(retrievedUpdatedEvent)
  })

  it('get all event, return a list with all events with out filters', async () => {

    jest.spyOn(eventModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(LIST_EVENT_MOCK),
    } as any)

    const events = await eventModel.find().exec()

    expect(events).toEqual(LIST_EVENT_MOCK)
  })

  it('get all event, return a list with all events with filters', async () => {
    const queryMock = { year: '2024', headquarter: new ObjectId('654d4ac398b7a0abaa3c3a3e') }

    jest.spyOn(eventModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(EVENT_RESPONSE_MOCK),
    } as any)

    const events = await eventModel.find(queryMock).exec()

    expect(events).toEqual(EVENT_RESPONSE_MOCK)
  })

  describe('addAttendeeToEvent', () => {
    it('should add an attendee to the event', async () => {
      const event = {
        ...EVENT_RESPONSE_MOCK,
        save: jest.fn().mockResolvedValue(EVENT_RESPONSE_MOCK)
      }

      jest.spyOn(eventModel, 'findById').mockResolvedValue(event)

      const result = await eventService.addAttendeeToEvent(Object(EVENT_ID_MOCK), Object(USER_ID_MOCK), ATTENDEE_DATA_MOCK)

      expect(result).toEqual(EVENT_RESPONSE_MOCK)
      expect(event.attendees).toContainEqual(USER_ID_MOCK)
      expect(event.save).toHaveBeenCalled()


    });

    it('should throw NotFoundException if event does not exist', async () => {
      jest.spyOn(eventModel, 'findById').mockResolvedValue(null);

      await expect(eventService.addAttendeeToEvent(Object(EVENT_ID_MOCK), Object(USER_ID_MOCK), ATTENDEE_DATA_MOCK))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if event status is not ACTIVE', async () => {
      const event = { _id: EVENT_ID_MOCK, status: EventStatus.INACTIVE };

      jest.spyOn(eventModel, 'findById').mockResolvedValue(event);

      await expect(eventService.addAttendeeToEvent(Object(EVENT_ID_MOCK), Object(USER_ID_MOCK), ATTENDEE_DATA_MOCK))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user is already attending the event', async () => {

      const event = { _id: EVENT_ID_MOCK, attendees: [USER_ID_MOCK] };

      jest.spyOn(eventModel, 'findById').mockResolvedValue(event);
      await expect(eventService.addAttendeeToEvent(Object(EVENT_ID_MOCK), Object(USER_ID_MOCK), ATTENDEE_DATA_MOCK))
        .rejects.toThrow(BadRequestException);
    });
  });
})
