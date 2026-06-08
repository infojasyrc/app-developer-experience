import { Injectable } from '@nestjs/common'
import { App, cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import getEnvironmentVariables from '../../infrastructure/environment'

@Injectable()
export class FirebaseAdminService {
  private static app: App

  onModuleInit() {
    if (!FirebaseAdminService.app) {
      const { GOOGLE_APPLICATION_CREDENTIALS } = getEnvironmentVariables()
      const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)
      FirebaseAdminService.app = initializeApp({
        credential: cert(credentials),
      })
    }
  }

  getAuth() {
    return getAuth(FirebaseAdminService.app)
  }

  getStorage() {
    return getStorage(FirebaseAdminService.app)
  }
}
