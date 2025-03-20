// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Point to the src directory where your Next.js app lives
  dir: './src',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Handle module aliases - adjusted for src directory
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/ui/(.*)$': '<rootDir>/ui/$1',
    // Handle other aliases your project may have
  },
  
  // Important for modern Next.js with App Router
  transformIgnorePatterns: [
    '/node_modules/(?!(@swc|next|react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend))',
  ],
  
  // Specifically target app directory, adjusted for src
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/src/app/api/',
    '<rootDir>/public/',
  ],
  
  // Coverage configuration, adjusted for src
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!**/index.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest/**',
    '!jest.config.js',
    '!next.config.js',
  ],
  
  // Set the root directory for imports and modules to src
  roots: ['<rootDir>/src'],

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);