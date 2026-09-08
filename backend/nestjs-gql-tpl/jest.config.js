module.exports = {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!main.ts",
      "!**/*.module.ts",
      "!**/*.schema.ts",
      "!**/feature-flags.usecase.ts"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "testResultsProcessor": "jest-sonar-reporter"
  }