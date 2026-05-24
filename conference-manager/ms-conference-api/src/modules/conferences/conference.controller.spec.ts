import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { ConferenceController } from './conference.controller'
import { ConferenceService } from './conference.service'
import { ConferenceStatus } from './conference.enum'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { ImageUploadInterceptor } from '../events/interceptors/image-upload.interceptor'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'

import {
  CONFERENCE_MOCK,
  CONFERENCE_ID_MOCK,
  USER_ID_MOCK,
  CREATE_CONFERENCE_MOCK_DTO,
  UPDATE_CONFERENCE_MOCK_DTO,
  ADD_ATTENDEE_MOCK_DTO,
  getMockList,
} from './test/stubs/conference.stub'

describe('ConferenceController', () => {
  let controller: ConferenceController
  let service: ConferenceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FirebaseModule],
      controllers: [ConferenceController],
      providers: [
        ConferenceService,
        Logger,
        FirebaseAdminService,
        FirebaseUploadService,
        ImageUploadInterceptor,
        {
          provide: getModelToken('Conference'),
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<ConferenceController>(ConferenceController)
    service = module.get<ConferenceService>(ConferenceService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create and return a conference', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(CONFERENCE_MOCK as any)

      const result = await controller.create(CREATE_CONFERENCE_MOCK_DTO)

      expect(result).toEqual(CONFERENCE_MOCK)
    })
  })

  describe('getAll', () => {
    it('should return all conferences for admin', async () => {
      const mockList = getMockList(undefined)
      jest.spyOn(service, 'getAll').mockResolvedValue(mockList as any)
      const dto: RequestGetAllConferencesDto = { isAdmin: true }

      const result = await controller.getAll(dto)

      expect(result).toEqual(mockList)
    })

    it('should return only active conferences for non-admin', async () => {
      const mockList = getMockList(ConferenceStatus.ACTIVE)
      jest.spyOn(service, 'getAll').mockResolvedValue(mockList as any)
      const dto: RequestGetAllConferencesDto = { isAdmin: false }

      const result = await controller.getAll(dto)

      expect(result).toEqual(mockList)
      expect(result.every(c => c.status === ConferenceStatus.ACTIVE)).toBeTruthy()
    })
  })

  describe('getById', () => {
    it('should return one conference by id', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(CONFERENCE_MOCK as any)

      const result = await controller.getById(Object(CONFERENCE_ID_MOCK))

      expect(result).toEqual(CONFERENCE_MOCK)
    })
  })

  describe('update', () => {
    it('should update and return the conference', async () => {
      const updated = { ...CONFERENCE_MOCK, description: 'Updated description' }
      jest.spyOn(service, 'update').mockResolvedValue(updated as any)

      const result = await controller.update(Object(CONFERENCE_ID_MOCK), UPDATE_CONFERENCE_MOCK_DTO)

      expect(result).toEqual(updated)
    })
  })

  describe('delete', () => {
    it('should soft-delete a conference and return void', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined)

      const result = await controller.delete(Object(CONFERENCE_ID_MOCK))

      expect(result).toBeUndefined()
      expect(service.delete).toHaveBeenCalledWith(Object(CONFERENCE_ID_MOCK))
    })
  })

  describe('addAttendeeToConference', () => {
    it('should add an attendee to the conference', async () => {
      jest.spyOn(service, 'addAttendeeToConference').mockResolvedValue(CONFERENCE_MOCK as any)

      const result = await controller.addAttendeeToConference(
        Object(CONFERENCE_ID_MOCK),
        String(USER_ID_MOCK),
        ADD_ATTENDEE_MOCK_DTO,
      )

      expect(result).toEqual(CONFERENCE_MOCK)
    })
  })
})
