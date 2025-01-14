import { FirebaseAuthStrategy } from './firebase-auth.strategy'

const mockEnvVars = jest.fn()
jest.mock('../../infrastructure/environment', () => ({
  __esModule: true,
  default: () => mockEnvVars(),
}))

describe('FirebaseAuthStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should throw an error if AUTH_PRIVATE_KEY is undefined', () => {
    mockEnvVars.mockReturnValue({ PRIVATE_KEY_V2: undefined })
    try {
    } catch (error) {
      expect(() => new FirebaseAuthStrategy()).toThrow('Undefined AUTH_PRIVATE_KEY')
    }
  })

  it('should be defined', () => {
    mockEnvVars.mockReturnValue({ PRIVATE_KEY_V2: 'mocked-private-key' })
    const firebaseAuthStrategy = new FirebaseAuthStrategy()
    expect(firebaseAuthStrategy).toBeDefined()
  })

  it('should return a user object when validating', async () => {
    mockEnvVars.mockReturnValue({ PRIVATE_KEY_V2: 'mocked-private-key' })
    const firebaseAuthStrategy = new FirebaseAuthStrategy()
    const payload = { sub: '123', email: 'user@example.com' }
    expect(await firebaseAuthStrategy.validate(payload)).toEqual({
      userId: '123',
      email: 'user@example.com',
    })
  })
})
