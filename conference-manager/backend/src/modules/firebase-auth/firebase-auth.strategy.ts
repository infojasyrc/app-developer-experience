import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-custom'
import { FirebaseAdminService } from './firebase-admin.service'

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase-auth') {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {
    super()
  }

  async validate(request: Request): Promise<{ userId: string; email: string; role: string }> {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided')
    }

    const token = authHeader.split('Bearer ')[1]

    try {
      const decodedToken = await this.firebaseAdminService.getAuth().verifyIdToken(token)
      return {
        userId: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role as string,
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
