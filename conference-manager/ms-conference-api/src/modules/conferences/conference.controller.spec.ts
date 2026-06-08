import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { ConferenceController } from './conference.controller'
import { ConferenceService } from './conference.service'
import { ConferenceStatus } from './conference.enum'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'

import {
  CONFERENCE_MOCK,
  CONFERENCE_ID_MOCK,
  USER_ID_MOCK,
  CREATE_CONFERENCE_MOCK_DTO,
  UPDATE_CONFERENCE_MOCK_DTO,
  ADD_ATTENDEE_MOCK_DTO,
  UPDATE_CONFERENCE_STATUS_DTO_MOCK,
  MOCK_CONFERENCE_IMAGE_FILE,
  MOCK_CONFERENCE_IMAGE_URL,
  MOCK_CONFERENCE_IMAGE_FILENAME,
  getMockList,
} from './test/stubs/conference.stub'

const mockFirebaseUploadService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
}

describe('ConferenceController', () => {
  let controller: ConferenceController
  let service: ConferenceService

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConferenceController],
      providers: [
        ConferenceService,
        Logger,
        { provide: FirebaseUploadService, useValue: mockFirebaseUploadService },
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

  describe('updateStatus', () => {
    it('should update and return the conference with the new status', async () => {
      const updated = { ...CONFERENCE_MOCK, status: ConferenceStatus.ACTIVE }
      jest.spyOn(service, 'updateStatus').mockResolvedValue(updated as any)

      const result = await controller.updateStatus(
        String(CONFERENCE_ID_MOCK),
        UPDATE_CONFERENCE_STATUS_DTO_MOCK,
      )

      expect(service.updateStatus).toHaveBeenCalledWith(
        String(CONFERENCE_ID_MOCK),
        UPDATE_CONFERENCE_STATUS_DTO_MOCK,
      )
      expect(result.status).toBe(ConferenceStatus.ACTIVE)
    })
  })

  describe('uploadImage', () => {
    it('should upload an image and return the updated conference', async () => {
      const updated = { ...CONFERENCE_MOCK, images: [MOCK_CONFERENCE_IMAGE_URL] }
      jest.spyOn(service, 'uploadImage').mockResolvedValue(updated as any)

      const result = await controller.uploadImage(String(CONFERENCE_ID_MOCK), {
        image: MOCK_CONFERENCE_IMAGE_FILE,
      })

      expect(service.uploadImage).toHaveBeenCalledWith(
        String(CONFERENCE_ID_MOCK),
        MOCK_CONFERENCE_IMAGE_FILE,
      )
      expect(result.images).toContain(MOCK_CONFERENCE_IMAGE_URL)
    })
  })

  describe('deleteImage', () => {
    it('should delete an image from the conference', async () => {
      jest.spyOn(service, 'deleteImage').mockResolvedValue(undefined)

      await controller.deleteImage(
        String(CONFERENCE_ID_MOCK),
        encodeURIComponent(MOCK_CONFERENCE_IMAGE_FILENAME),
      )

      expect(service.deleteImage).toHaveBeenCalledWith(
        String(CONFERENCE_ID_MOCK),
        MOCK_CONFERENCE_IMAGE_FILENAME,
      )
    })
  })

  describe('exportAttendees', () => {
    it('should return a CSV string with attendee data', async () => {
      const csv = 'uid,firstName,lastName,email\n"uid1","John","Doe","john@example.com"'
      jest.spyOn(service, 'exportAttendeesAsCsv').mockResolvedValue(csv)
      const mockRes = { set: jest.fn() } as any

      const result = await controller.exportAttendees(String(CONFERENCE_ID_MOCK), mockRes)

      expect(service.exportAttendeesAsCsv).toHaveBeenCalledWith(String(CONFERENCE_ID_MOCK))
      expect(result).toBe(csv)
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/csv')
    })
  })
})
