const dotenv = require('dotenv')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')
const { initializeApp } = require('firebase/app')
const { roleSettings } = require('../credentials')

dotenv.config()

const firebaseConfig = {
  apiKey: process.env.AUTH_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.AUTH_PROJECT_ID,
  storageBucket: process.env.AUTH_STORAGE_BUCKET,
  messagingSenderId: process.env.AUTH_MESSAGING_SENDER_ID,
  appId: process.env.AUTH_APP_ID,
  measurementId: process.env.AUTH_MEASUREMENT_ID,
}

let app = null

const getFirebaseApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

const runAuthentication = async () => {
  const auth = getAuth(getFirebaseApp())
  const role = process.argv[2] || 'admin'
  const { email, password } = roleSettings[role]

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const token = await userCredential.user.getIdToken()
    console.log(role, 'token:\n', token)
  } catch (error) {
    console.error('Authenticaton Error', error)
    process.exit(1)
  }
}

runAuthentication()
