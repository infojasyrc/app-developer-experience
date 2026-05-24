import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

const MOCK_UID = 'firebase-uid-abc123'
const MOCK_EMAIL = 'user@example.com'

const MOCK_USER_RESPONSE = {
  _id: '64a1b2c3d4e5f6789abcdef0',
  uid: MOCK_UID,
  firstName: 'John',
  lastName: 'Doe',
  email: MOCK_EMAIL,
  isAdmin: false,
  isSuperAdmin: false,
}

const REGISTER_DTO = {
  email: MOCK_EMAIL,
  password: 'secret123',
  firstName: 'John',
  lastName: 'Doe',
}

const RESET_PASSWORD_DTO = { email: MOCK_EMAIL }

const mockAuthService = {
  register: jest.fn(),
  revokeToken: jest.fn(),
  resetPassword: jest.fn(),
}

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        Logger,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  describe('register', () => {
    it('returns the created user', async () => {
      mockAuthService.register.mockResolvedValue(MOCK_USER_RESPONSE)

      const result = await controller.register(REGISTER_DTO as any)

      expect(mockAuthService.register).toHaveBeenCalledWith(REGISTER_DTO)
      expect(result).toEqual(MOCK_USER_RESPONSE)
    })
  })

  describe('revokeToken', () => {
    it('calls revokeToken with the uid from the request user', async () => {
      const mockRevoked = { revokedAt: '2024-01-01T00:00:00.000Z' }
      mockAuthService.revokeToken.mockResolvedValue(mockRevoked)

      const req = { user: { uid: MOCK_UID } } as any
      const result = await controller.revokeToken(req)

      expect(mockAuthService.revokeToken).toHaveBeenCalledWith(MOCK_UID)
      expect(result).toEqual(mockRevoked)
    })
  })

  describe('resetPassword', () => {
    it('calls resetPassword with the email and returns undefined', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined)

      const result = await controller.resetPassword(RESET_PASSWORD_DTO as any)

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(MOCK_EMAIL)
      expect(result).toBeUndefined()
    })
  })
})
