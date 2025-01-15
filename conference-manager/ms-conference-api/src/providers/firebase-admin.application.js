'use strict'

const admin = require('firebase-admin')
const dotenv = require('dotenv')
const getEnvironmentVariables = require('./../infrastructure/environment')

const serviceAccount = require('./../services-config/app.json')

dotenv.config()

let app = null

const getFirebaseAccountVariables = () => {
  const {
    PROJECT_ID,
    PRIVATE_KEY_ID,
    PRIVATE_KEY,
    CLIENT_EMAIL,
    CLIENT_ID,
    CLIENT_X509_CERT_URL,
    STORAGE_BUCKET,
  } = getEnvironmentVariables()

  const account = {
    ...serviceAccount,
    project_id: PROJECT_ID,
    private_key_id: PRIVATE_KEY_ID,
    private_key: PRIVATE_KEY,
    client_email: CLIENT_EMAIL,
    client_id: CLIENT_ID,
    client_x509_cert_url: CLIENT_X509_CERT_URL,
  }

  return { account, storageBucket: STORAGE_BUCKET }
}

module.exports = () => {
  const { account, storageBucket } = getFirebaseAccountVariables()

  // application should works without firebase authentication
  if (!account.project_id) return app

  // initialize firebase
  if (!app) {
    app = admin.initializeApp({
      credential: admin.credential.cert(account),
      storageBucket,
    })
  }

  return app
}
