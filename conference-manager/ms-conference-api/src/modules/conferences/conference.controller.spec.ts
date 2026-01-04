import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { ConferenceController } from './conference.controller'
import { ConferenceService } from './conference.service'
import { ConferenceStatus } from './conference.enum'

import {
  getMockList,
} from './test/stubs/conference.stub'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'

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

  describe('get all', () => {
    it.skip('should return all conferences for admin', async () => {
      const mockConferenceList = getMockList(undefined)
      jest.spyOn(service, 'getAll').mockResolvedValue(mockConferenceList)
      const dtoRequest: RequestGetAllConferencesDto = {
        isAdmin: true,
      }
      // for admin, all status events are returned
      const result = await controller.getAll(dtoRequest)

      expect(result).toEqual(mockConferenceList)
    })

    it('should return all conferences for No admin', async () => {
      const mockConferenceList = getMockList(ConferenceStatus.ACTIVE)
      jest.spyOn(service, 'getAll').mockResolvedValue(mockConferenceList)
      const dtoRequest: RequestGetAllConferencesDto = {
        isAdmin: false,
      }
      // for no admin, all status events are ACTIVE
      const result = await controller.getAll(dtoRequest)

      expect(result).toEqual(mockConferenceList)
      // validate that all events are ACTIVE
      expect(result.every(event => event.status === ConferenceStatus.ACTIVE)).toBeTruthy()
    })
  })
})
