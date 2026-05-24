import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { UserService } from './user.service'
import { User } from './user.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { BadRequestException } from '../../exceptions/BadRequest'
import {
  USER_MOCK,
  LIST_USERS_MOCK,
  CREATE_USER_MOCK_DTO,
  UPDATE_USER_MOCK_DTO,
} from '../../helpers/mocks/users/user-detail'

const mockExec = jest.fn()
const mockUserModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
  findOneAndDelete: jest.fn(),
}

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockUserModel.find.mockReturnValue({ exec: mockExec })
    mockUserModel.findOneAndUpdate.mockReturnValue({ exec: mockExec })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        Logger,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('UserService should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a user and return the mapped response', async () => {
      mockUserModel.findOne.mockResolvedValue(null)
      mockUserModel.create.mockResolvedValue(USER_MOCK)

      const result = await service.create(CREATE_USER_MOCK_DTO)

      expect(mockUserModel.create).toHaveBeenCalled()
      expect(result).toEqual(USER_MOCK)
    })

    it('should throw BadRequestException when uid already exists', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(USER_MOCK)

      await expect(service.create(CREATE_USER_MOCK_DTO)).rejects.toThrow(BadRequestException)
      expect(mockUserModel.create).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException when email already exists', async () => {
      mockUserModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(USER_MOCK)

      await expect(service.create(CREATE_USER_MOCK_DTO)).rejects.toThrow(BadRequestException)
      expect(mockUserModel.create).not.toHaveBeenCalled()
    })
  })

  // ─── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return a mapped list of users', async () => {
      mockExec.mockResolvedValueOnce(LIST_USERS_MOCK)

      const result = await service.getAll()

      expect(mockUserModel.find).toHaveBeenCalled()
      expect(result).toHaveLength(LIST_USERS_MOCK.length)
    })
  })

  // ─── getByUid ─────────────────────────────────────────────────────────────────

  describe('getByUid', () => {
    it('should return the mapped user when found', async () => {
      mockUserModel.findOne.mockResolvedValue(USER_MOCK)

      const result = await service.getByUid(USER_MOCK.uid)

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ uid: USER_MOCK.uid })
      expect(result).toEqual(USER_MOCK)
    })

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      await expect(service.getByUid('non-existent-uid')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should return the updated user', async () => {
      const updated = { ...USER_MOCK, firstName: 'Updated', isAdmin: true }
      mockExec.mockResolvedValueOnce(updated)

      const result = await service.update(USER_MOCK.uid, UPDATE_USER_MOCK_DTO)

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uid: USER_MOCK.uid },
        expect.objectContaining({ firstName: 'Updated' }),
        { new: true },
      )
      expect(result).toEqual(updated)
    })

    it('should throw NotFoundException when user does not exist', async () => {
      mockExec.mockResolvedValueOnce(null)

      await expect(service.update('non-existent-uid', UPDATE_USER_MOCK_DTO)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should hard-delete the user', async () => {
      mockUserModel.findOneAndDelete.mockResolvedValue(USER_MOCK)

      await service.delete(USER_MOCK.uid)

      expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ uid: USER_MOCK.uid })
    })

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserModel.findOneAndDelete.mockResolvedValue(null)

      await expect(service.delete('non-existent-uid')).rejects.toThrow(NotFoundException)
    })
  })
})
