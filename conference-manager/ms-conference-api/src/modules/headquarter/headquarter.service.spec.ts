import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { HeadquarterService } from './headquarter.service'
import { Headquarter } from './headquarter.entity'
import { Conference } from '../conferences/conference.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { BadRequestException } from '../../exceptions/BadRequest'
import {
  HEADQUARTERMOCK,
  LISTHEADQUARTERMOCK,
  MOCKOBJECTID,
  CREATE_HEADQUARTER_MOCK_DTO,
  UPDATE_HEADQUARTER_MOCK_DTO,
} from '../../helpers/mocks/events/headquarter-detail'

const mockExec = jest.fn()
const mockHeadquarterModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findOne: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
  findByIdAndDelete: jest.fn(),
}
const mockConferenceModel = {
  countDocuments: jest.fn(),
}

describe('HeadquarterService', () => {
  let service: HeadquarterService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockHeadquarterModel.find.mockReturnValue({ exec: mockExec })
    mockHeadquarterModel.findOneAndUpdate.mockReturnValue({ exec: mockExec })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeadquarterService,
        Logger,
        { provide: getModelToken(Headquarter.name), useValue: mockHeadquarterModel },
        { provide: getModelToken(Conference.name), useValue: mockConferenceModel },
      ],
    }).compile()

    service = module.get<HeadquarterService>(HeadquarterService)
  })

  it('HeadquarterService should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a headquarter and return the mapped response', async () => {
      mockHeadquarterModel.findOne.mockResolvedValue(null)
      mockHeadquarterModel.create.mockResolvedValue(HEADQUARTERMOCK)

      const result = await service.create(CREATE_HEADQUARTER_MOCK_DTO)

      expect(mockHeadquarterModel.create).toHaveBeenCalled()
      expect(result).toEqual(HEADQUARTERMOCK)
    })

    it('should throw BadRequestException when name already exists', async () => {
      mockHeadquarterModel.findOne.mockResolvedValue(HEADQUARTERMOCK)

      await expect(service.create(CREATE_HEADQUARTER_MOCK_DTO)).rejects.toThrow(BadRequestException)
      expect(mockHeadquarterModel.create).not.toHaveBeenCalled()
    })
  })

  // ─── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return a mapped list of headquarters', async () => {
      mockExec.mockResolvedValueOnce(LISTHEADQUARTERMOCK)

      const result = await service.getAll()

      expect(mockHeadquarterModel.find).toHaveBeenCalled()
      expect(result).toHaveLength(LISTHEADQUARTERMOCK.length)
      expect(result[0]).toHaveProperty('_id')
      expect(result[0]).toHaveProperty('name')
    })
  })

  // ─── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return the mapped headquarter when found', async () => {
      mockHeadquarterModel.findById.mockResolvedValue(HEADQUARTERMOCK)

      const result = await service.getById(String(MOCKOBJECTID))

      expect(result).toEqual(HEADQUARTERMOCK)
    })

    it('should throw NotFoundException when headquarter does not exist', async () => {
      mockHeadquarterModel.findById.mockResolvedValue(null)

      await expect(service.getById(String(MOCKOBJECTID))).rejects.toThrow(NotFoundException)
    })
  })

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should return the updated headquarter', async () => {
      const updated = { ...HEADQUARTERMOCK, name: 'Bogota Updated' }
      mockExec.mockResolvedValueOnce(updated)

      const result = await service.update(String(MOCKOBJECTID), UPDATE_HEADQUARTER_MOCK_DTO)

      expect(mockHeadquarterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: String(MOCKOBJECTID) },
        expect.objectContaining({ name: 'Bogota Updated' }),
        { new: true },
      )
      expect(result).toEqual(updated)
    })

    it('should throw NotFoundException when headquarter does not exist', async () => {
      mockExec.mockResolvedValueOnce(null)

      await expect(service.update(String(MOCKOBJECTID), UPDATE_HEADQUARTER_MOCK_DTO)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete the headquarter when no conferences are linked', async () => {
      mockHeadquarterModel.findById.mockResolvedValue(HEADQUARTERMOCK)
      mockConferenceModel.countDocuments.mockResolvedValue(0)
      mockHeadquarterModel.findByIdAndDelete.mockResolvedValue(HEADQUARTERMOCK)

      await service.delete(String(MOCKOBJECTID))

      expect(mockHeadquarterModel.findByIdAndDelete).toHaveBeenCalledWith(String(MOCKOBJECTID))
    })

    it('should throw NotFoundException when headquarter does not exist', async () => {
      mockHeadquarterModel.findById.mockResolvedValue(null)

      await expect(service.delete(String(MOCKOBJECTID))).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when headquarter has linked conferences', async () => {
      mockHeadquarterModel.findById.mockResolvedValue(HEADQUARTERMOCK)
      mockConferenceModel.countDocuments.mockResolvedValue(3)

      await expect(service.delete(String(MOCKOBJECTID))).rejects.toThrow(BadRequestException)
      expect(mockHeadquarterModel.findByIdAndDelete).not.toHaveBeenCalled()
    })
  })
})
