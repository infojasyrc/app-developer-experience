module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '^firebase-admin$': '<rootDir>/__mocks__/firebase-admin.ts',
    '^firebase-admin/app$': '<rootDir>/__mocks__/firebase-admin/app.ts',
    '^firebase-admin/auth$': '<rootDir>/__mocks__/firebase-admin/auth.ts',
    '^firebase-admin/storage$': '<rootDir>/__mocks__/firebase-admin/storage.ts',
    '^unleash-client$': '<rootDir>/__mocks__/unleash-client.ts',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
}
