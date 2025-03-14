import getFirebaseApp from './firebase'

const getAPIProvider = (providerType: string) => {
  switch (providerType) {
    case 'axios':
      break

    case 'firebase':
    default:
      return getFirebaseApp()
  }
}

export default getAPIProvider
