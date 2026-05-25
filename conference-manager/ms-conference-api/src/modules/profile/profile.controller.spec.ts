import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { ProfileController } from './profile.controller'
import { UserService } from '../users/user.service'
import { User } from '../users/user.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { USER_MOCK } from '../../helpers/mocks/users/user-detail'

describe('ProfileController', () => {
  let controller: ProfileController
  let userService: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        UserService,
        Logger,
        { provide: getModelToken(User.name), useValue: {} },
      ],
    }).compile()

    controller = module.get<ProfileController>(ProfileController)
    userService = module.get<UserService>(UserService)
  })

  it('ProfileController should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getProfile', () => {
    it('returns the user record for the authenticated uid', async () => {
      jest.spyOn(userService, 'getByUid').mockResolvedValue(USER_MOCK)

      const req = { user: { userId: USER_MOCK.uid } } as any
      const result = await controller.getProfile(req)

      expect(userService.getByUid).toHaveBeenCalledWith(USER_MOCK.uid)
      expect(result).toEqual(USER_MOCK)
    })

    it('propagates NotFoundException when the uid has no matching user record', async () => {
      jest.spyOn(userService, 'getByUid').mockRejectedValue(new NotFoundException('not found'))

      const req = { user: { userId: 'unknown-uid' } } as any

      await expect(controller.getProfile(req)).rejects.toThrow(NotFoundException)
    })
  })
})
