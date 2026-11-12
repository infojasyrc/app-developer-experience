import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'

import { AuthService } from './auth.service'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { UserService } from '../users/user.service'

const MOCK_UID = 'firebase-uid-abc123'
const MOCK_EMAIL = 'user@example.com'
const MOCK_REVOKED_AT = '2024-01-01T00:00:00.000Z'

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

const mockAuth = {
  createUser: jest.fn(),
  revokeRefreshTokens: jest.fn(),
  getUser: jest.fn(),
  generatePasswordResetLink: jest.fn(),
}

const mockFirebaseAdminService = {
  getAuth: jest.fn().mockReturnValue(mockAuth),
}

const mockUserService = {
  create: jest.fn(),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockFirebaseAdminService.getAuth.mockReturnValue(mockAuth)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        Logger,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  describe('register', () => {
    it('creates a Firebase user then a DB user record', async () => {
      mockAuth.createUser.mockResolvedValue({ uid: MOCK_UID })
      mockUserService.create.mockResolvedValue(MOCK_USER_RESPONSE)

      const result = await service.register(REGISTER_DTO as any)

      expect(mockAuth.createUser).toHaveBeenCalledWith({
        email: MOCK_EMAIL,
        password: 'secret123',
      })
      expect(mockUserService.create).toHaveBeenCalledWith({
        uid: MOCK_UID,
        email: MOCK_EMAIL,
        firstName: 'John',
        lastName: 'Doe',
      })
      expect(result).toEqual(MOCK_USER_RESPONSE)
    })

    it('propagates Firebase errors', async () => {
      mockAuth.createUser.mockRejectedValue(new Error('Firebase error'))
      await expect(service.register(REGISTER_DTO as any)).rejects.toThrow('Firebase error')
    })
  })

  describe('revokeToken', () => {
    it('revokes refresh tokens and returns the revocation timestamp', async () => {
      mockAuth.revokeRefreshTokens.mockResolvedValue(undefined)
      mockAuth.getUser.mockResolvedValue({ tokensValidAfterTime: MOCK_REVOKED_AT })

      const result = await service.revokeToken(MOCK_UID)

      expect(mockAuth.revokeRefreshTokens).toHaveBeenCalledWith(MOCK_UID)
      expect(mockAuth.getUser).toHaveBeenCalledWith(MOCK_UID)
      expect(result).toEqual({ revokedAt: new Date(MOCK_REVOKED_AT).toISOString() })
    })

    it('propagates errors from revokeRefreshTokens', async () => {
      mockAuth.revokeRefreshTokens.mockRejectedValue(new Error('Revoke failed'))
      await expect(service.revokeToken(MOCK_UID)).rejects.toThrow('Revoke failed')
    })
  })

  describe('resetPassword', () => {
    it('calls generatePasswordResetLink with the given email', async () => {
      mockAuth.generatePasswordResetLink.mockResolvedValue('https://reset-link')

      await service.resetPassword(MOCK_EMAIL)

      expect(mockAuth.generatePasswordResetLink).toHaveBeenCalledWith(MOCK_EMAIL)
    })

    it('propagates errors from generatePasswordResetLink', async () => {
      mockAuth.generatePasswordResetLink.mockRejectedValue(new Error('Email not found'))
      await expect(service.resetPassword(MOCK_EMAIL)).rejects.toThrow('Email not found')
    })
  })
})
