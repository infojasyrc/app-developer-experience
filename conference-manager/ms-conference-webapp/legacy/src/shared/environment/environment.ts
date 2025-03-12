export interface IEnvironment {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
  baseApiPath: string
}

const getEnvVariables = (): IEnvironment => {
  if (!process.env.REACT_APP_BASE_PATH) {
    throw new Error('Api base url');
  }

  const config: IEnvironment = {
    apiKey: process.env.REACT_APP_API_KEY || '',
    authDomain: process.env.REACT_APP_AUTH_DOMAIN || '',
    databaseURL: process.env.REACT_APP_DATABASE_URL || '',
    projectId: process.env.REACT_APP_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
    measurementId: process.env.REACT_APP_MEASUREMENT_ID || '',
    baseApiPath: process.env.REACT_APP_BASE_PATH || '',
  }
  return config;
}

export default getEnvVariables
