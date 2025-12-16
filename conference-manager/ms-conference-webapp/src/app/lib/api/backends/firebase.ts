import { FirebaseApp, initializeApp } from 'firebase/app'

import { config } from '../../../shared/environment'

let app: FirebaseApp

const getFirebaseApp = () => {
  const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    databaseURL: config.databaseURL,
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export default getFirebaseApp
