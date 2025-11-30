// interfaces/auth/firebase.guard.ts
import {
  CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { Auth } from 'firebase-admin/auth';
import { isAuthEnabled } from '../../infrastructure/unleash.provider';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject('FIREBASE_AUTH') private auth: Auth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Gate Firebase auth behind Unleash feature flag.
    if (!isAuthEnabled()) {
      return true;
    }

    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException();

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      request.user = decodedToken;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
