import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { HeadquarterController } from './headquarter.controller'
import { HeadquarterService } from './headquarter.service'
import { Headquarter } from './headquarter.entity'
import { Conference } from '../conferences/conference.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import {
  HEADQUARTERMOCK,
  LISTHEADQUARTERMOCK,
  MOCKOBJECTID,
  CREATE_HEADQUARTER_MOCK_DTO,
  UPDATE_HEADQUARTER_MOCK_DTO,
} from '../../helpers/mocks/headquarters/headquarter-detail'

describe('HeadquarterController', () => {
  let controller: HeadquarterController
  let service: HeadquarterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadquarterController],
      providers: [
        HeadquarterService,
        Logger,
        { provide: getModelToken(Headquarter.name), useValue: {} },
        { provide: getModelToken(Conference.name), useValue: {} },
      ],
    }).compile()

    controller = module.get<HeadquarterController>(HeadquarterController)
    service = module.get<HeadquarterService>(HeadquarterService)
  })

  it('HeadquarterController should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create and return a headquarter', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(HEADQUARTERMOCK)

      const result = await controller.create(CREATE_HEADQUARTER_MOCK_DTO)

      expect(service.create).toHaveBeenCalledWith(CREATE_HEADQUARTER_MOCK_DTO)
      expect(result).toEqual(HEADQUARTERMOCK)
    })
  })

  describe('getAll', () => {
    it('should return a list of headquarters', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue(LISTHEADQUARTERMOCK)

      const result = await controller.getAll()

      expect(result).toEqual(LISTHEADQUARTERMOCK)
    })
  })

  describe('getById', () => {
    it('should return a headquarter by id', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(HEADQUARTERMOCK)

      const result = await controller.getById(String(MOCKOBJECTID))

      expect(service.getById).toHaveBeenCalledWith(String(MOCKOBJECTID))
      expect(result).toEqual(HEADQUARTERMOCK)
    })

    it('should propagate NotFoundException when not found', async () => {
      jest.spyOn(service, 'getById').mockRejectedValue(new NotFoundException('not found'))

      await expect(controller.getById('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update and return the headquarter', async () => {
      const updated = { ...HEADQUARTERMOCK, name: 'Bogota Updated' }
      jest.spyOn(service, 'update').mockResolvedValue(updated)

      const result = await controller.update(String(MOCKOBJECTID), UPDATE_HEADQUARTER_MOCK_DTO)

      expect(service.update).toHaveBeenCalledWith(String(MOCKOBJECTID), UPDATE_HEADQUARTER_MOCK_DTO)
      expect(result).toEqual(updated)
    })
  })

  describe('delete', () => {
    it('should delete a headquarter', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined)

      await controller.delete(String(MOCKOBJECTID))

      expect(service.delete).toHaveBeenCalledWith(String(MOCKOBJECTID))
    })
  })
})
