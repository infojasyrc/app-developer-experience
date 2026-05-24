import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { UserController } from './user.controller'
import { UserService } from '../../modules/users/user.service'
import { User } from '../../modules/users/user.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import {
  USER_MOCK,
  LIST_USERS_MOCK,
  CREATE_USER_MOCK_DTO,
  UPDATE_USER_MOCK_DTO,
} from '../../helpers/mocks/users/user-detail'

describe('UserController', () => {
  let controller: UserController
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        Logger,
        { provide: getModelToken(User.name), useValue: {} },
      ],
    }).compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  it('UserController should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create and return a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(USER_MOCK)

      const result = await controller.create(CREATE_USER_MOCK_DTO)

      expect(service.create).toHaveBeenCalledWith(CREATE_USER_MOCK_DTO)
      expect(result).toEqual(USER_MOCK)
    })
  })

  describe('getAll', () => {
    it('should return a list of users', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue(LIST_USERS_MOCK)

      const result = await controller.getAll()

      expect(result).toEqual(LIST_USERS_MOCK)
    })
  })

  describe('getByUid', () => {
    it('should return a user by uid', async () => {
      jest.spyOn(service, 'getByUid').mockResolvedValue(USER_MOCK)

      const result = await controller.getByUid(USER_MOCK.uid)

      expect(service.getByUid).toHaveBeenCalledWith(USER_MOCK.uid)
      expect(result).toEqual(USER_MOCK)
    })

    it('should propagate NotFoundException when user is not found', async () => {
      jest.spyOn(service, 'getByUid').mockRejectedValue(new NotFoundException('not found'))

      await expect(controller.getByUid('non-existent-uid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update and return the user', async () => {
      const updated = { ...USER_MOCK, firstName: 'Updated', isAdmin: true }
      jest.spyOn(service, 'update').mockResolvedValue(updated)

      const result = await controller.update(USER_MOCK.uid, UPDATE_USER_MOCK_DTO)

      expect(service.update).toHaveBeenCalledWith(USER_MOCK.uid, UPDATE_USER_MOCK_DTO)
      expect(result).toEqual(updated)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined)

      await controller.delete(USER_MOCK.uid)

      expect(service.delete).toHaveBeenCalledWith(USER_MOCK.uid)
    })
  })
})
