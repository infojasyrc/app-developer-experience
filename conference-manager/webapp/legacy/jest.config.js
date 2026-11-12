module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/fileTransformer.js',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  // setupFiles: ['<rootDir>/jest/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setupAfterEnv.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {},
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx,js,jsx}',
    'src/contexts/**/*.{ts,tsx,js,jsx}',
    'src/database/**/*.{ts,tsx,js,jsx}',
    'src/environment/**/*.{ts,tsx,js,jsx}',
    'src/hocs/**/*.{ts,tsx,js,jsx}',
    'src/providers/**/*.{ts,tsx,js,jsx}',
    'src/routes/**/*.{ts,tsx,js,jsx}',
    'src/tools/**/*.{ts,tsx,js,jsx}',
    'src/styles/**/*.{ts,tsx,js,jsx}',
    //   '!pages/_app.tsx',
    //   '!pages/_document.tsx',
    //   '!pages/**/*.{ts,tsx}',
    '!/node_modules/',
    '!./**/index.{ts,tsx}',
    '!./**/*.stories.tsx',
  ],
  // TODO: Everything should be 90
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 16,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
}
