import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'

import { RoleService } from './role.service'
import { Role } from './role.entity'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { ROLE_MOCK, LIST_ROLES_MOCK, MOCK_ROLE_ID } from '../../helpers/mocks/roles/role-detail'

const mockExec = jest.fn()
const mockRoleModel = {
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findById: jest.fn(),
}

describe('RoleService', () => {
  let service: RoleService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockRoleModel.find.mockReturnValue({ exec: mockExec })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        Logger,
        { provide: getModelToken(Role.name), useValue: mockRoleModel },
      ],
    }).compile()

    service = module.get<RoleService>(RoleService)
  })

  it('RoleService should be defined', () => {
    expect(service).toBeDefined()
  })

  // ─── getAll ──────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('returns a mapped list of roles', async () => {
      mockExec.mockResolvedValueOnce(LIST_ROLES_MOCK)

      const result = await service.getAll()

      expect(mockRoleModel.find).toHaveBeenCalled()
      expect(result).toHaveLength(LIST_ROLES_MOCK.length)
      expect(result[0]).toHaveProperty('_id')
      expect(result[0]).toHaveProperty('name')
    })

    it('returns an empty array when no roles exist', async () => {
      mockExec.mockResolvedValueOnce([])

      const result = await service.getAll()

      expect(result).toEqual([])
    })
  })

  // ─── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('returns the mapped role when found', async () => {
      mockRoleModel.findById.mockResolvedValue(ROLE_MOCK)

      const result = await service.getById(String(MOCK_ROLE_ID))

      expect(mockRoleModel.findById).toHaveBeenCalledWith(String(MOCK_ROLE_ID))
      expect(result).toEqual({ _id: ROLE_MOCK._id, name: ROLE_MOCK.name })
    })

    it('throws NotFoundException when role does not exist', async () => {
      mockRoleModel.findById.mockResolvedValue(null)

      await expect(service.getById(String(MOCK_ROLE_ID))).rejects.toThrow(NotFoundException)
    })
  })
})
