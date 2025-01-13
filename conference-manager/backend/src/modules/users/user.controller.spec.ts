import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserResponse } from './interfaces/user-response'
import { AdddUserRequestDto } from './dto/add-user-request.dto'

const USER_ID_MOCK = new Types.ObjectId('65c516a7eae2b91375ecba6e')
const USER_UID_MOCK = '2qWPH'
const USER_RESPONSE_MOCK: UserResponse = {
  _id: USER_ID_MOCK,
  uid: USER_UID_MOCK,
  firstName: 'User',
  lastName: 'Test',
  email: 'usertest@project.com',
  isAdmin: false,
}

describe('UserController', () => {
  let controller: UserController
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [
        UserService,
        Logger,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should get by userId', async () => {
    jest.spyOn(service, 'getByUserId').mockResolvedValue(USER_RESPONSE_MOCK)

    const result = await controller.getByUserId(Object(USER_UID_MOCK))

    expect(result).toEqual(USER_RESPONSE_MOCK)
  })

  it('should add new user', async () => {
    const mockNewUser: AdddUserRequestDto = {
      uid: USER_UID_MOCK,
      firstName: 'User',
      lastName: 'Test',
      email: 'usertest@project.com',
    }
    jest.spyOn(service, 'addUser').mockResolvedValue(USER_RESPONSE_MOCK)

    const result = await controller.addNewUser(mockNewUser)

    expect(result).toEqual(USER_RESPONSE_MOCK)
  })
})
