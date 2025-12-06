// infrastructure/firebase-auth.provider.ts
import * as admin from 'firebase-admin';
import { isAuthEnabled } from './unleash.provider';

if (isAuthEnabled()) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const FirebaseAuthProvider = {
  provide: 'FIREBASE_AUTH',
  useValue: isAuthEnabled() ? admin.auth() : ({} as any),
};
