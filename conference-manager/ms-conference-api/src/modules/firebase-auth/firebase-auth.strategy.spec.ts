import { UnauthorizedException } from '@nestjs/common'
import { FirebaseAdminService } from './firebase-admin.service'
import { FirebaseAuthStrategy } from './firebase-auth.strategy'

const mockVerifyIdToken = jest.fn()
const mockGetAuth = jest.fn(() => ({ verifyIdToken: mockVerifyIdToken }))

jest.mock('./firebase-admin.service')

describe('FirebaseAuthStrategy', () => {
  let strategy: FirebaseAuthStrategy
  let mockFirebaseAdminService: jest.Mocked<FirebaseAdminService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFirebaseAdminService = {
      getAuth: mockGetAuth,
    } as unknown as jest.Mocked<FirebaseAdminService>

    strategy = new FirebaseAuthStrategy(mockFirebaseAdminService)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const mockRequest = { headers: {} } as any
    await expect(strategy.validate(mockRequest)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when authorization header is not Bearer', async () => {
    const mockRequest = { headers: { authorization: 'Basic abc123' } } as any
    await expect(strategy.validate(mockRequest)).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))
    const mockRequest = { headers: { authorization: 'Bearer invalid-token' } } as any
    await expect(strategy.validate(mockRequest)).rejects.toThrow(UnauthorizedException)
  })

  it('should return user object when token is valid', async () => {
    const mockDecodedToken = { uid: '123', email: 'user@example.com', role: 'admin' }
    mockVerifyIdToken.mockResolvedValue(mockDecodedToken)
    const mockRequest = { headers: { authorization: 'Bearer valid-token' } } as any

    const result = await strategy.validate(mockRequest)

    expect(result).toEqual({ userId: '123', email: 'user@example.com', role: 'admin' })
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
  })
})
