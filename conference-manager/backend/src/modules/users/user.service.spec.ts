import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Connection, connect, Model, Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { UserResponse } from './interfaces/user-response'
import { User, UserSchema } from './user.entity'
import { UserService } from './user.service'
import { AdddUserRequestDto } from './dto/add-user-request.dto'

export const USER_ID_MOCK = new Types.ObjectId('65c516a7eae2b91375ecba6e')
const USER_UID_MOCK = '2qWPH'
const USER_RESPONSE_MOCK: UserResponse = {
  _id: USER_ID_MOCK,
  uid: USER_UID_MOCK,
  firstName: 'User',
  lastName: 'Test',
  email: 'usertest@project.com',
  isAdmin: false,
}

describe('UserService', () => {
  let service: UserService
  let logger: Logger

  let userModel: Model<User>

  let mongod: MongoMemoryServer
  let mongoConnection: Connection

  beforeAll(async () => {
    await createDBServer()
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, Logger, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile()

    service = module.get<UserService>(UserService)
    logger = module.get<Logger>(Logger)
  })

  const createDBServer = async () => {
    mongod = await MongoMemoryServer.create()
    const URI = mongod.getUri()
    mongoConnection = (await connect(URI)).connection
    userModel = mongoConnection.model(User.name, UserSchema)
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

  it('user service should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get user by userId', () => {
    it('should return user information', async () => {
      const userMock = USER_RESPONSE_MOCK

      jest.spyOn(userModel, 'findOne').mockResolvedValue(userMock)

      const user = await service.getByUserId({ uid: USER_UID_MOCK })

      expect(user?.firstName).toBe(userMock.firstName)
      expect(user?.lastName).toEqual(userMock.lastName)
      expect(user?.isAdmin).toBe(userMock.isAdmin)
      expect(user?.uid).toBe(userMock.uid)
      expect(user?.email).toBe(userMock.email)
    })

    it('should throw an error', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null)

      await expect(service.getByUserId({ uid: USER_UID_MOCK })).rejects.toThrowError(
        'User not found'
      )
    })
  })

  describe('add user', () => {
    it('should return the new user', async () => {
      const mockExpectedId = new Types.ObjectId('65c516a7eae2b91375ecba6a')
      const userMock: AdddUserRequestDto = {
        uid: USER_UID_MOCK,
        firstName: 'User',
        lastName: 'Test',
        email: 'user.test@email.com',
      }
      jest.spyOn(userModel.prototype, 'save').mockResolvedValue({
        ...userMock,
        _id: mockExpectedId,
      })
      const result = await service.addUser(userMock)
      expect(result._id).toEqual(mockExpectedId)
      expect(result.uid).toEqual(userMock.uid)
      expect(result.email).toEqual(userMock.email)
      expect(result.firstName).toEqual(userMock.firstName)
      expect(result.lastName).toEqual(userMock.lastName)
    })

    it('should throw an error', async () => {})
  })
})
