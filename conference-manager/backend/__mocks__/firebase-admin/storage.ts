const mockFile = {
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    end: jest.fn(),
  }),
  makePublic: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
}

const mockBucket = {
  name: 'mock-bucket',
  file: jest.fn().mockReturnValue(mockFile),
}

const mockStorage = {
  bucket: jest.fn().mockReturnValue(mockBucket),
}

export const getStorage = jest.fn().mockReturnValue(mockStorage)
