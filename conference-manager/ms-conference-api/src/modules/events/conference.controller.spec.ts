import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { ConferenceController } from './conference.controller'
import { EventService } from './event.service'

import {
  getMockListEvents,
} from '../../helpers/mocks/events/event-detail'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'

describe('ConferenceController', () => {
  let controller: EventController
  let service: EventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FirebaseModule],
      controllers: [EventController],
      providers: [
        EventService,
        Logger,
        FirebaseAdminService,
        FirebaseUploadService,
        {
          provide: getModelToken('Event'),
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<EventController>(EventController)
    service = module.get<EventService>(EventService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('get all', () => {
    it('should return all conferences for admin', async () => {
      const mocksEvents = getMockListEvents(undefined)
      jest.spyOn(service, 'getAll').mockResolvedValue(mocksEvents)
      const dtoRequest: RequestGetAllEventsDto = {
        isAdmin: true,
      }
      // for admin, all status events are returned
      const result = await controller.getAll(dtoRequest)

      expect(result).toEqual(mocksEvents)
    })

    it('should return all conferences for No admin', async () => {
      const mocksEvents = getMockListEvents('ACTIVE')
      jest.spyOn(service, 'getAll').mockResolvedValue(mocksEvents)
      const dtoRequest: RequestGetAllEventsDto = {
        isAdmin: false,
      }
      // for no admin, all status events are ACTIVE
      const result = await controller.getAll(dtoRequest)

      expect(result).toEqual(mocksEvents)
      // validate that all events are ACTIVE
      expect(result.every(event => event.status === 'ACTIVE')).toBeTruthy()
    })
  })
})
