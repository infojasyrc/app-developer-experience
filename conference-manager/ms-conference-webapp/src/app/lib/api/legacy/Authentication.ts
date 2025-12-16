import {
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import Security from './security'

import getFirebaseApp from '../../backends/firebase'
import { Credentials } from '../../../shared/entities'

function Authentication() {

  const login = (credentials: Credentials) => {
    const fireApp = getFirebaseApp()
    const auth = getAuth(fireApp)

    return signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )
  }

  const verifyAuth = () => {
    return new Promise<{ isAuth: boolean; userUid: string; email: string }>(
      (resolve, reject) => {
        const auth = getAuth(getFirebaseApp())
        auth.onAuthStateChanged((user) => {
          const { uid, email } = user ?? {}
          if (uid) {
            resolve({
              isAuth: true,
              userUid: uid,
              email: email as string,
            })
          } else {
            reject({ isAuth: false, userUid: '', email: '' })
          }
        })
      }
    )
  }

  const logout = () => {
    const auth = getAuth(getFirebaseApp())
    return signOut(auth)
  }

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    const auth = getAuth(getFirebaseApp())

    provider.setCustomParameters({
      prompt: 'select_account',
    })
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const idTokenResult = await user.getIdTokenResult()
      const displayName = idTokenResult.claims.name || user.displayName

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        token: idTokenResult.token,
      }

      return userData
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during sign-in', error)
    }
  }

  const logoutApp = async () => {
    const api = Security()

    try {
      await logout()
      await api.revokeToken()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return {
    login,
    logout,
    logoutApp,
    verifyAuth,
    googleSignIn,
  }
}

export default Authentication
