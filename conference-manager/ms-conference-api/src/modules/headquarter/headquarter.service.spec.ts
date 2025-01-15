import { Logger } from '@nestjs/common'
import { HeadquarterService } from './headquarter.service'
import { Connection, Model, connect } from 'mongoose'
import { Headquarter, HeadquarterSchema } from './headquarter.entity'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { HEADQUARTERMOCK, LISTHEADQUARTERMOCK } from '../../helpers/mocks/events/headquarter-detail'

describe('HeadquartersService', () => {
  let headquartersService: HeadquarterService
  let logger: Logger

  let headquartersModel: Model<Headquarter>

  let mongodb: MongoMemoryServer
  let mongoConnection: Connection

  beforeAll(async () => {
    await createDBServer()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadquarterService,
        Logger,
        { provide: getModelToken(Headquarter.name), useValue: headquartersModel },
      ],
    }).compile()

    headquartersService = module.get<HeadquarterService>(HeadquarterService)
    logger = module.get<Logger>(Logger)
  })
  const createDBServer = async () => {
    mongodb = await MongoMemoryServer.create()
    const URI = mongodb.getUri()
    mongoConnection = (await connect(URI)).connection
    headquartersModel = mongoConnection.model(Headquarter.name, HeadquarterSchema)
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
      await mongodb.stop()
    } catch (error) {
      console.log('error', error)
    }
  })

  it('headquarter Service should be defined', () => {
    expect(headquartersService).toBeDefined()
  })

  it('get all, return a list with all headquarters', async () => {
    const headquartersData = LISTHEADQUARTERMOCK

    jest.spyOn(headquartersModel, 'find').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(headquartersData),
    } as any)

    const headquarters = await headquartersModel.find().exec()

    expect(headquarters).toEqual(headquartersData)
  })

  it('get by id, return a headquarter detail ', async () => {
    const id = '65b9373f6f3ef0a59e20975a'
    const headquartersData = HEADQUARTERMOCK

    jest.spyOn(headquartersModel, 'findById').mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(headquartersData),
    } as any)

    const headquarters = await headquartersModel.findById(id).exec()

    expect(headquarters).toEqual(headquartersData)
  })
})
