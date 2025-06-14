// infrastructure/firebase-auth.provider.ts
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const FirebaseAuthProvider = {
  provide: 'FIREBASE_AUTH',
  useValue: admin.auth(),
};
