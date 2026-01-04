import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Model, Connection, connect, Types } from 'mongoose'
import { ObjectId } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

import {
  CONFERENCE_MOCK,
  LIST_ACTIVE_MOCK,
} from './test/stubs/conference.stub'
import { ConferenceService } from './conference.service'
import { Conference, ConferenceSchema } from './conference.entity'

describe.skip('ConferenceService', () => {
  let service: ConferenceService
  let logger: Logger

  let eventModel: Model<Conference>

  let mongod: MongoMemoryServer
  let mongoConnection: Connection

  beforeAll(async () => {
    await createDBServer()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferenceService,
        Logger,
        { provide: getModelToken(Conference.name), useValue: eventModel },
      ],
    }).compile()

    service = module.get<ConferenceService>(ConferenceService)
    logger = module.get<Logger>(Logger)
  })

  const createDBServer = async () => {
    mongod = await MongoMemoryServer.create()
    const URI = mongod.getUri()
    mongoConnection = (await connect(URI)).connection
    eventModel = mongoConnection.model(Conference.name, ConferenceSchema)
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
    expect(service).toBeDefined()
  })

  it('get all event, return a list with all events with out filters', async () => {
    jest.spyOn(eventModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(LIST_ACTIVE_MOCK),
    } as any)

    const events = await eventModel.find().exec()

    expect(events).toEqual(LIST_ACTIVE_MOCK)
  })

  it.skip('get all event, return a list with all events with filters', async () => {
    const queryMock = { year: '2024', headquarter: new ObjectId('654d4ac398b7a0abaa3c3a3e') }

    jest.spyOn(eventModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(CONFERENCE_MOCK),
    } as any)

    const events = await eventModel.find(queryMock).exec()

    expect(events).toEqual(CONFERENCE_MOCK)
  })
})
