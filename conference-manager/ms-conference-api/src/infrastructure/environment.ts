import dotenv from 'dotenv'

dotenv.config()

export interface EnvironmentVariables {
  ENVIRONMENT: string
  DEFAULT_DB: string
  MONGODB_URI: string
  FIREBASE_PROJECT_ID: string | undefined
  FIREBASE_API_KEY: string | undefined
  FIREBASE_AUTH_DOMAIN: string | undefined
  FIREBASE_APP_ID: string | undefined
  GOOGLE_APPLICATION_CREDENTIALS: string
  REQUIRES_AUTH: boolean
  UNLEASH_URL: string
  UNLEASH_API_KEY: string
  UNLEASH_APP_NAME: string
  UNLEASH_TOGGLE_AUTH: string
}

const validateEnvVariableForDBConnection = (): void => {
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST is required for running the application')
  }
  if (!process.env.DB_PORT) {
    throw new Error('DB_PORT is required for running the application')
  }
  if (!process.env.DB_ROOT_USERNAME) {
    throw new Error('User name Credentials for the database is required for running the application')
  }
  if (!process.env.DB_ROOT_PASSWORD) {
    throw new Error('DB PASSWORD is required for running the application')
  }
  if (!process.env.DEFAULT_DB) {
    throw new Error('Database name is required for running the application')
  }
}

const getURLForDBConnection = (): string =>
  `mongodb://${process.env.DB_ROOT_USERNAME}:${process.env.DB_ROOT_PASSWORD}` +
  `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DEFAULT_DB}?authSource=admin`

function getEnvironmentVariables(): EnvironmentVariables {
  validateEnvVariableForDBConnection()

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required for running the application')
  }

  return {
    ENVIRONMENT: process.env.NODE_ENV ?? 'development',
    // process.env.DEFAULT_DB is guaranteed non-null after validateEnvVariableForDBConnection
    DEFAULT_DB: process.env.DEFAULT_DB as string,
    MONGODB_URI: getURLForDBConnection(),
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    REQUIRES_AUTH: process.env.REQUIRES_AUTH === 'true',
    UNLEASH_URL: process.env.UNLEASH_URL ?? 'http://localhost:4242/api',
    UNLEASH_API_KEY: process.env.UNLEASH_API_KEY ?? '',
    UNLEASH_APP_NAME: process.env.UNLEASH_APP_NAME ?? 'conference-manager',
    UNLEASH_TOGGLE_AUTH: process.env.UNLEASH_TOGGLE_AUTH ?? 'auth.firebase.enabled',
  }
}

export default getEnvironmentVariables
