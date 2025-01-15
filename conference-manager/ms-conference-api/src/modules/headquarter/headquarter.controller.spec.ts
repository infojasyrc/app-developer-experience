import { Test, TestingModule } from '@nestjs/testing'
import { HeadquarterController } from './headquarter.controller'
import { HeadquarterService } from './headquarter.service'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import {
  HEADQUARTERMOCK,
  LISTHEADQUARTERMOCK,
  MOCKOBJECTID,
} from '../../helpers/mocks/events/headquarter-detail'

describe('HeadquarterController', () => {
  let controller: HeadquarterController
  let service: HeadquarterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadquarterController],
      providers: [
        HeadquarterService,
        Logger,
        {
          provide: getModelToken('Headquarter'),
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<HeadquarterController>(HeadquarterController)
    service = module.get<HeadquarterService>(HeadquarterService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('get all headquarters', () => {
    it('should return headquarter list', async () => {
      const response: HeadquarterResponse[] = LISTHEADQUARTERMOCK
      jest.spyOn(service, 'getAll').mockResolvedValue(response)

      const result = await controller.getAll()

      expect(result).toEqual(response)
    })
  })
  describe('get headquarter by id', () => {
    it('should return the information about one headquarter', async () => {
      const response: HeadquarterResponse = HEADQUARTERMOCK
      jest.spyOn(service, 'getById').mockResolvedValue(response)

      const result = await controller.getById(MOCKOBJECTID.toString())

      expect(result).toEqual(response)
    })
  })
})
