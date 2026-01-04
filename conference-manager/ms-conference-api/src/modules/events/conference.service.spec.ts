import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Model, Connection, connect, Types } from 'mongoose'
import { ObjectId } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

import {
  EVENT_RESPONSE_MOCK,
  LIST_EVENT_MOCK,
  EVENT_ID_MOCK,
  UPDATE_EVENT_MOCK_DTO,
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
})
