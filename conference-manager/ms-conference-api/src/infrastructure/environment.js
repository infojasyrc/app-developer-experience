const os = require('os')
const dotenv = require('dotenv')

dotenv.config()

const validateEnvVariableForDBConnection = () => {
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST is required for running the application')
  }

  if (!process.env.DB_PORT) {
    throw new Error('DB_PORT is required for running the application')
  }

  if (!process.env.DB_ROOT_USERNAME) {
    throw new Error(
      'User name Credentials for the database is required for running the application'
    )
  }

  if (!process.env.DB_ROOT_PASSWORD) {
    throw new Error('DB PASSWORD is required for running the application')
  }

  if (!process.env.DEFAULT_DB) {
    throw new Error('Database name is required for running the application')
  }
}

const getURLForDBConnection = () => {
  const url =
    `mongodb://${process.env.DB_ROOT_USERNAME}:${process.env.DB_ROOT_PASSWORD}` +
    `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DEFAULT_DB}?authSource=admin`
  return url
}

function getEnvironmentVariables() {
  // Determine whether auth is required. If REQUIRES_AUTH explicitly set use that; otherwise infer from presence of AUTH_PRIVATE_KEY.
  let requires_auth
  if (typeof process.env.REQUIRES_AUTH !== 'undefined') {
    requires_auth = process.env.REQUIRES_AUTH === 'true'
  } else {
    requires_auth = !!process.env.AUTH_PRIVATE_KEY
  }

  // Only validate Firebase private key when auth is required.
  let privateKey = null
  if (requires_auth) {
    if (!process.env.AUTH_PRIVATE_KEY) {
      // If auth requested but key missing, downgrade to auth disabled to avoid hard failure.
      console.warn('[env] AUTH_PRIVATE_KEY missing; disabling auth feature.')
      requires_auth = false
    } else {
      // This is a hack to make the private key work on mac and linux
      privateKey = JSON.parse(`${JSON.stringify(process.env.AUTH_PRIVATE_KEY)}`)
      if (os.type() === 'Darwin') {
        privateKey = JSON.parse(`"${process.env.AUTH_PRIVATE_KEY}"`)
      }
    }
  }

  validateEnvVariableForDBConnection()

  const all_variables = {
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    // This variable should be removed when legacy will be removed
    DEFAULT_DB: process.env.DEFAULT_DB,
    MONGODB_URI: getURLForDBConnection(),
    // All Firebase environment variables
    PROJECT_ID: process.env.AUTH_PROJECT_ID,
    PRIVATE_KEY_ID: process.env.AUTH_PRIVATE_KEY_ID,
    PRIVATE_KEY: privateKey,
    CLIENT_EMAIL: process.env.AUTH_CLIENT_EMAIL,
    CLIENT_ID: process.env.AUTH_CLIENT_ID,
    CLIENT_X509_CERT_URL: process.env.AUTH_CLIENT_CERT_URL,
    STORAGE_BUCKET: process.env.AUTH_STORAGE_BUCKET,
    PRIVATE_KEY_V2: process.env.PRIVATE_KEY_V2,
    PRIVATE_KEY_ADMIN_V2: process.env.PRIVATE_KEY_ADMIN_V2,
    REQUIRES_AUTH: requires_auth,
    // Unleash environment variables
    UNLEASH_URL: process.env.UNLEASH_URL || 'http://localhost:4242/api',
    UNLEASH_API_KEY: process.env.UNLEASH_API_KEY || '',
    UNLEASH_APP_NAME: process.env.UNLEASH_APP_NAME || 'conference-manager',
    UNLEASH_TOGGLE_AUTH: process.env.UNLEASH_TOGGLE_AUTH || 'auth.firebase.enabled',
  }

  return all_variables
}

module.exports = getEnvironmentVariables
