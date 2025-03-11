'use strict'

const getEnvironmentVariables = require('./../infrastructure/environment')
const setupFirebaseAdminSDKApp = require('./firebase-admin.application')
const Mongo = require('./mongo-client')

module.exports = async () => {
  const environmentVariables = getEnvironmentVariables()

  const adminSDK = environmentVariables.REQUIRES_AUTH ? setupFirebaseAdminSDKApp() : null
  const adminAuth = adminSDK ? adminSDK.auth() : null
  const dbInstance = adminSDK ? adminSDK.firestore() : null
  const bucket = adminSDK ? adminSDK.storage().bucket() : null

  const mongo = new Mongo()
  const clientMongo = await mongo.dbInstance()

  return {
    adminAuth,
    dbInstance,
    bucket,
    clientMongo,
  }
}
