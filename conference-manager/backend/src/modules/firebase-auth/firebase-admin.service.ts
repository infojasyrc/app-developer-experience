import { Injectable } from '@nestjs/common'
import { App, applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

@Injectable()
export class FirebaseAdminService {
  private static app: App

  onModuleInit() {
    if (!FirebaseAdminService.app) {
      FirebaseAdminService.app = initializeApp({
        credential: applicationDefault(),
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
