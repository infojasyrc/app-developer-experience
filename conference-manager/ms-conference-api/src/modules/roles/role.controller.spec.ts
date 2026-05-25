import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { RoleController } from './role.controller'
import { RoleService } from './role.service'
import { Role } from './role.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { ROLE_MOCK, LIST_ROLES_MOCK, MOCK_ROLE_ID } from '../../helpers/mocks/roles/role-detail'

describe('RoleController', () => {
  let controller: RoleController
  let service: RoleService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        RoleService,
        Logger,
        { provide: getModelToken(Role.name), useValue: {} },
      ],
    }).compile()

    controller = module.get<RoleController>(RoleController)
    service = module.get<RoleService>(RoleService)
  })

  it('RoleController should be defined', () => {
    expect(controller).toBeDefined()
  })

  // ─── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('returns a list of roles', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue(LIST_ROLES_MOCK)

      const result = await controller.getAll()

      expect(service.getAll).toHaveBeenCalled()
      expect(result).toEqual(LIST_ROLES_MOCK)
    })
  })

  // ─── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('returns a role by id', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(ROLE_MOCK)

      const result = await controller.getById(String(MOCK_ROLE_ID))

      expect(service.getById).toHaveBeenCalledWith(String(MOCK_ROLE_ID))
      expect(result).toEqual(ROLE_MOCK)
    })

    it('propagates NotFoundException when role is not found', async () => {
      jest.spyOn(service, 'getById').mockRejectedValue(new NotFoundException('not found'))

      await expect(controller.getById('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })
})
