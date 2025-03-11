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
  let requires_auth = !process.env.REQUIRES_AUTH ? true : process.env.REQUIRES_AUTH === 'true'

  if (!process.env.AUTH_PRIVATE_KEY) {
    throw new Error('AUTH_PRIVATE_KEY is required for running the application')
  }

  // This is a hack to make the private key work on mac and linux
  let privateKey = JSON.parse(`${JSON.stringify(process.env.AUTH_PRIVATE_KEY)}`)
  if (os.type() === 'Darwin') {
    privateKey = JSON.parse(`"${process.env.AUTH_PRIVATE_KEY}"`)
  }

  validateEnvVariableForDBConnection()

  const all_variables = {
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
  }

  return all_variables
}

module.exports = getEnvironmentVariables
