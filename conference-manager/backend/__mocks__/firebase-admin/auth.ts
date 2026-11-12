const mockAuth = {
  verifyIdToken: jest.fn(),
  createUser: jest.fn(),
  revokeRefreshTokens: jest.fn(),
  getUser: jest.fn(),
  generatePasswordResetLink: jest.fn(),
}

export const getAuth = jest.fn().mockReturnValue(mockAuth)
