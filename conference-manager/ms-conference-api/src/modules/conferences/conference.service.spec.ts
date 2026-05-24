import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { ConferenceService } from './conference.service'
import { Conference } from './conference.entity'
import { ConferenceStatus } from './conference.enum'
import { BadRequestException } from '../../exceptions/BadRequest'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { FirebaseModule } from '../firebase-auth/firebase.module'

import {
  CONFERENCE_MOCK,
  CONFERENCE_ID_MOCK,
  USER_ID_MOCK,
  LIST_ACTIVE_MOCK,
  CREATE_CONFERENCE_MOCK_DTO,
  UPDATE_CONFERENCE_MOCK_DTO,
  ADD_ATTENDEE_MOCK_DTO,
  MOCK_HEADQUARTER,
} from './test/stubs/conference.stub'

const mockExec = jest.fn()
const mockConferenceModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findOne: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
}

describe('ConferenceService', () => {
  let service: ConferenceService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConferenceModel.find.mockReturnValue({ exec: mockExec })
    mockConferenceModel.findOneAndUpdate.mockReturnValue({ exec: mockExec })

    const module: TestingModule = await Test.createTestingModule({
      imports: [FirebaseModule],
      providers: [
        ConferenceService,
        Logger,
        FirebaseAdminService,
        FirebaseUploadService,
        { provide: getModelToken(Conference.name), useValue: mockConferenceModel },
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

    it('should filter by owner when isAdmin is true', async () => {
      const userId = 'owner-uid'
      mockExec.mockResolvedValueOnce(LIST_ACTIVE_MOCK)

      await service.getAll({ isAdmin: true, userId })

      expect(mockConferenceModel.find).toHaveBeenCalledWith({ owner: userId })
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
})
