'use strict'

const setupFirebaseAdminSDKApp = require('./firebase-admin.application')
const Mongo = require('./mongo-client')

module.exports = async () => {
  // TODO: Thos should be called only when authentication is required
  const adminSDK = setupFirebaseAdminSDKApp()
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
