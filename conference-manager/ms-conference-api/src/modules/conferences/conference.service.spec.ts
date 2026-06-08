import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { ConferenceService } from './conference.service'
import { Conference } from './conference.entity'
import { ConferenceStatus } from './conference.enum'
import { BadRequestException } from '../../exceptions/BadRequest'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'

import {
  CONFERENCE_MOCK,
  CONFERENCE_ID_MOCK,
  USER_ID_MOCK,
  LIST_ACTIVE_MOCK,
  CREATE_CONFERENCE_MOCK_DTO,
  UPDATE_CONFERENCE_MOCK_DTO,
  ADD_ATTENDEE_MOCK_DTO,
  MOCK_HEADQUARTER,
  UPDATE_CONFERENCE_STATUS_DTO_MOCK,
  MOCK_CONFERENCE_IMAGE_FILE,
  MOCK_CONFERENCE_IMAGE_URL,
  MOCK_CONFERENCE_IMAGE_FILENAME,
} from './test/stubs/conference.stub'

const mockExec = jest.fn()
const mockConferenceModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
}

const mockFirebaseUploadService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
}

describe('ConferenceService', () => {
  let service: ConferenceService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConferenceModel.find.mockReturnValue({ exec: mockExec })
    mockConferenceModel.findOneAndUpdate.mockReturnValue({ exec: mockExec })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferenceService,
        Logger,
        { provide: getModelToken(Conference.name), useValue: mockConferenceModel },
        { provide: FirebaseUploadService, useValue: mockFirebaseUploadService },
      ],
    }).compile()

    service = module.get<ConferenceService>(ConferenceService)
  })

  it('ConferenceService should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a conference and return it', async () => {
      mockConferenceModel.findOne.mockResolvedValue(null)
      mockConferenceModel.create.mockResolvedValue(CONFERENCE_MOCK)

      const result = await service.create(CREATE_CONFERENCE_MOCK_DTO)

      expect(mockConferenceModel.create).toHaveBeenCalled()
      expect(result).toEqual(CONFERENCE_MOCK)
    })

    it('should throw BadRequestException when name already exists', async () => {
      mockConferenceModel.findOne.mockResolvedValue(CONFERENCE_MOCK)

      await expect(service.create(CREATE_CONFERENCE_MOCK_DTO)).rejects.toThrow(BadRequestException)
      expect(mockConferenceModel.create).not.toHaveBeenCalled()
    })
  })

  // ─── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return active conferences when isAdmin is false', async () => {
      mockExec.mockResolvedValueOnce(LIST_ACTIVE_MOCK)

      const result = await service.getAll({ isAdmin: false })

      expect(mockConferenceModel.find).toHaveBeenCalledWith({ status: ConferenceStatus.ACTIVE })
      expect(result).toEqual(LIST_ACTIVE_MOCK)
    })

    it('should filter by createdBy when isAdmin is true', async () => {
      const createdBy = 'owner-uid'
      mockExec.mockResolvedValueOnce(LIST_ACTIVE_MOCK)

      await service.getAll({ isAdmin: true, createdBy })

      expect(mockConferenceModel.find).toHaveBeenCalledWith({ createdBy })
    })

    it('should pass extra filters (year, headquarter) to the query', async () => {
      mockExec.mockResolvedValueOnce([LIST_ACTIVE_MOCK[0]])
      const hqId = String(MOCK_HEADQUARTER._id)

      await service.getAll({ isAdmin: false, year: '2024', headquarter: hqId })

      expect(mockConferenceModel.find).toHaveBeenCalledWith({
        status: ConferenceStatus.ACTIVE,
        year: '2024',
        headquarter: hqId,
      })
    })
  })

  // ─── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return a conference when found', async () => {
      mockConferenceModel.findById.mockResolvedValue(CONFERENCE_MOCK)

      const result = await service.getById(Object(CONFERENCE_ID_MOCK))

      expect(result).toEqual(CONFERENCE_MOCK)
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findById.mockResolvedValue(null)

      await expect(service.getById(Object(CONFERENCE_ID_MOCK))).rejects.toThrow(NotFoundException)
    })
  })

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should return the updated conference', async () => {
      const updated = { ...CONFERENCE_MOCK, description: 'Updated description' }
      mockExec.mockResolvedValueOnce(updated)

      const result = await service.update(Object(CONFERENCE_ID_MOCK), UPDATE_CONFERENCE_MOCK_DTO)

      expect(mockConferenceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: Object(CONFERENCE_ID_MOCK) },
        expect.objectContaining({ description: 'Updated description' }),
        { new: true },
      )
      expect(result).toEqual(updated)
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockExec.mockResolvedValueOnce(null)

      await expect(service.update(Object(CONFERENCE_ID_MOCK), UPDATE_CONFERENCE_MOCK_DTO)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── delete ──────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should soft-delete by setting status to inactive', async () => {
      mockExec.mockResolvedValueOnce({ ...CONFERENCE_MOCK, status: ConferenceStatus.INACTIVE })

      await service.delete(Object(CONFERENCE_ID_MOCK))

      expect(mockConferenceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: Object(CONFERENCE_ID_MOCK) },
        { status: ConferenceStatus.INACTIVE },
        { new: true },
      )
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockExec.mockResolvedValueOnce(null)

      await expect(service.delete(Object(CONFERENCE_ID_MOCK))).rejects.toThrow(NotFoundException)
    })
  })

  // ─── addAttendeeToConference ──────────────────────────────────────────────────

  describe('addAttendeeToConference', () => {
    it('should add attendee to an active conference', async () => {
      const saveMock = jest.fn().mockResolvedValue({
        ...CONFERENCE_MOCK,
        attendees: [USER_ID_MOCK],
      })
      mockConferenceModel.findById.mockResolvedValue({
        ...CONFERENCE_MOCK,
        status: ConferenceStatus.ACTIVE,
        attendees: [] as Types.ObjectId[],
        save: saveMock,
      })

      const result = await service.addAttendeeToConference(
        Object(CONFERENCE_ID_MOCK),
        String(USER_ID_MOCK),
        ADD_ATTENDEE_MOCK_DTO,
      )

      expect(saveMock).toHaveBeenCalled()
      expect(result.attendees).toContainEqual(USER_ID_MOCK)
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findById.mockResolvedValue(null)

      await expect(
        service.addAttendeeToConference(Object(CONFERENCE_ID_MOCK), String(USER_ID_MOCK), ADD_ATTENDEE_MOCK_DTO),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when conference is not active', async () => {
      mockConferenceModel.findById.mockResolvedValue({
        ...CONFERENCE_MOCK,
        status: ConferenceStatus.INACTIVE,
      })

      await expect(
        service.addAttendeeToConference(Object(CONFERENCE_ID_MOCK), String(USER_ID_MOCK), ADD_ATTENDEE_MOCK_DTO),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when user is already attending', async () => {
      const userObjectId = new Types.ObjectId(String(USER_ID_MOCK))
      mockConferenceModel.findById.mockResolvedValue({
        ...CONFERENCE_MOCK,
        status: ConferenceStatus.ACTIVE,
        attendees: [userObjectId],
      })

      await expect(
        service.addAttendeeToConference(Object(CONFERENCE_ID_MOCK), String(USER_ID_MOCK), ADD_ATTENDEE_MOCK_DTO),
      ).rejects.toThrow(BadRequestException)
    })
  })

  // ─── updateStatus ────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('should update and return the conference with the new status', async () => {
      const updated = { ...CONFERENCE_MOCK, status: ConferenceStatus.ACTIVE }
      mockConferenceModel.findByIdAndUpdate.mockResolvedValue(updated)

      const result = await service.updateStatus(String(CONFERENCE_ID_MOCK), UPDATE_CONFERENCE_STATUS_DTO_MOCK)

      expect(mockConferenceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        String(CONFERENCE_ID_MOCK),
        { status: ConferenceStatus.ACTIVE, updatedBy: undefined },
        { new: true },
      )
      expect(result.status).toBe(ConferenceStatus.ACTIVE)
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findByIdAndUpdate.mockResolvedValue(null)

      await expect(
        service.updateStatus(String(CONFERENCE_ID_MOCK), UPDATE_CONFERENCE_STATUS_DTO_MOCK),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─── uploadImage ─────────────────────────────────────────────────────────────

  describe('uploadImage', () => {
    it('should upload the image and add its URL to conference.images', async () => {
      const conferenceWithSave = {
        ...CONFERENCE_MOCK,
        images: [] as string[],
        save: jest.fn().mockResolvedValue({ ...CONFERENCE_MOCK, images: [MOCK_CONFERENCE_IMAGE_URL] }),
      }
      mockConferenceModel.findById.mockResolvedValue(conferenceWithSave)
      mockFirebaseUploadService.uploadFile.mockResolvedValue(MOCK_CONFERENCE_IMAGE_URL)

      const result = await service.uploadImage(String(CONFERENCE_ID_MOCK), MOCK_CONFERENCE_IMAGE_FILE)

      expect(mockFirebaseUploadService.uploadFile).toHaveBeenCalledWith(MOCK_CONFERENCE_IMAGE_FILE)
      expect(conferenceWithSave.save).toHaveBeenCalled()
      expect(result.images).toContain(MOCK_CONFERENCE_IMAGE_URL)
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findById.mockResolvedValue(null)

      await expect(
        service.uploadImage(String(CONFERENCE_ID_MOCK), MOCK_CONFERENCE_IMAGE_FILE),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when image is not jpeg', async () => {
      const conferenceWithSave = { ...CONFERENCE_MOCK, images: [] as string[], save: jest.fn() }
      mockConferenceModel.findById.mockResolvedValue(conferenceWithSave)
      const invalidFile: Express.Multer.File = { ...MOCK_CONFERENCE_IMAGE_FILE, mimetype: 'image/png' }

      await expect(
        service.uploadImage(String(CONFERENCE_ID_MOCK), invalidFile),
      ).rejects.toThrow(BadRequestException)
    })
  })

  // ─── deleteImage ─────────────────────────────────────────────────────────────

  describe('deleteImage', () => {
    it('should delete the image from Firebase and remove it from conference.images', async () => {
      const conferenceWithSave = {
        ...CONFERENCE_MOCK,
        images: [MOCK_CONFERENCE_IMAGE_URL],
        save: jest.fn().mockResolvedValue(CONFERENCE_MOCK),
      }
      mockConferenceModel.findById.mockResolvedValue(conferenceWithSave)
      mockFirebaseUploadService.deleteFile.mockResolvedValue(undefined)

      await service.deleteImage(String(CONFERENCE_ID_MOCK), MOCK_CONFERENCE_IMAGE_FILENAME)

      expect(mockFirebaseUploadService.deleteFile).toHaveBeenCalledWith(MOCK_CONFERENCE_IMAGE_FILENAME)
      expect(conferenceWithSave.save).toHaveBeenCalled()
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findById.mockResolvedValue(null)

      await expect(
        service.deleteImage(String(CONFERENCE_ID_MOCK), MOCK_CONFERENCE_IMAGE_FILENAME),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─── exportAttendeesAsCsv ────────────────────────────────────────────────────

  describe('exportAttendeesAsCsv', () => {
    it('should return a CSV string with attendee data', async () => {
      const populated = {
        ...CONFERENCE_MOCK,
        attendees: [
          { uid: 'uid1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        ],
      }
      mockConferenceModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(populated),
      })

      const result = await service.exportAttendeesAsCsv(String(CONFERENCE_ID_MOCK))

      expect(result).toContain('uid,firstName,lastName,email')
      expect(result).toContain('"uid1","John","Doe","john@example.com"')
    })

    it('should return only the header when there are no attendees', async () => {
      const empty = { ...CONFERENCE_MOCK, attendees: [] as Types.ObjectId[] }
      mockConferenceModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(empty),
      })

      const result = await service.exportAttendeesAsCsv(String(CONFERENCE_ID_MOCK))

      expect(result).toBe('uid,firstName,lastName,email')
    })

    it('should throw NotFoundException when conference does not exist', async () => {
      mockConferenceModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      })

      await expect(
        service.exportAttendeesAsCsv(String(CONFERENCE_ID_MOCK)),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
