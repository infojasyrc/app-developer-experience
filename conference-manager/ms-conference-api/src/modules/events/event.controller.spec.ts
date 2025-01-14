import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { EventController } from './event.controller'
import { EventService } from './event.service'

import {
  EVENT_RESPONSE_MOCK,
  EVENT_ID_MOCK,
  CREATE_EVENT_MOCK_DTO,
  UPDATE_EVENT_DTO_MOCK,
  USER_ID_MOCK,
  ATTENDEE_DATA_MOCK,
  getMockListEvents,
} from '../../helpers/mocks/events/event-detail'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'

describe('EventController', () => {
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

  describe('create', () => {
    it('should create an event', async () => {
      const createDto = CREATE_EVENT_MOCK_DTO
      const expectedResult = EVENT_RESPONSE_MOCK

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult)

      const result = await controller.create(createDto)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('update', () => {
    it('should update an event', async () => {
      const id = EVENT_ID_MOCK
      const updateDto = UPDATE_EVENT_DTO_MOCK
      const responseDto = EVENT_RESPONSE_MOCK

      jest.spyOn(service, 'update').mockResolvedValue(responseDto)

      const result = await controller.update(Object(id), updateDto)

      expect(result).toEqual(responseDto)
    })
  })

  describe('addAttendeeToEvent', () => {
    it('should add an attendee to the event', async () => {
      jest.spyOn(service, 'addAttendeeToEvent').mockResolvedValue(EVENT_RESPONSE_MOCK)

      const result = await controller.addAttendeeToEvent(
        Object(EVENT_ID_MOCK),
        Object(USER_ID_MOCK),
        ATTENDEE_DATA_MOCK
      )

      expect(result).toEqual(EVENT_RESPONSE_MOCK)
    })
  })

  describe('get by id', () => {
    it('should return the information about one event', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(EVENT_RESPONSE_MOCK)

      const result = await controller.getById(Object(EVENT_ID_MOCK))

      expect(result).toEqual(EVENT_RESPONSE_MOCK)
    })
  })

  describe('get all', () => {
    it('should return all events for admin', async () => {
      const mocksEvents = getMockListEvents(undefined)
      jest.spyOn(service, 'getAll').mockResolvedValue(mocksEvents)
      const dtoRequest: RequestGetAllEventsDto = {
        isAdmin: true,
      }
      // for admin, all status events are returned
      const result = await controller.getAll(dtoRequest)

      expect(result).toEqual(mocksEvents)
    })

    it('should return all events for No admin', async () => {
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
