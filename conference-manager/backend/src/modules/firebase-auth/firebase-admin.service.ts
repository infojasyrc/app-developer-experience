import { Injectable } from '@nestjs/common'
import * as admin from 'firebase-admin'
import getEnvironmentVariables from '../../infrastructure/environment'
import { FIREBASE_APP_V2 } from '../../common/constants'

@Injectable()
export class FirebaseAdminService {
  private static instance: admin.app.App

  onModuleInit() {
    const { PROJECT_ID, PRIVATE_KEY_ADMIN_V2, CLIENT_EMAIL, STORAGE_BUCKET } =
      getEnvironmentVariables()

    const FIREBASE_SERVICE_ACCOUNT = {
      projectId: PROJECT_ID,
      privateKey: PRIVATE_KEY_ADMIN_V2.replace(/\\n/g, '\n'),
      clientEmail: CLIENT_EMAIL,
    }

    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = admin.initializeApp(
        {
          credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
          storageBucket: STORAGE_BUCKET,
        },
        FIREBASE_APP_V2
      )
    }
  }

  getStorage() {
    return FirebaseAdminService.instance.storage()
  }
}
