import { Injectable, Logger } from '@nestjs/common'

import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { UserService } from '../users/user.service'
import { RegisterDto } from './dto/register.dto'
import { UserResponse } from '../users/interfaces/user-response'

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponse> {
    this.logger.log(`Register user: ${dto.email}`)
    const firebaseUser = await this.firebaseAdminService.getAuth().createUser({
      email: dto.email,
      password: dto.password,
    })
    return this.userService.create({
      uid: firebaseUser.uid,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    })
  }

  async revokeToken(uid: string): Promise<{ revokedAt: string }> {
    this.logger.log(`Revoke refresh tokens for uid: ${uid}`)
    await this.firebaseAdminService.getAuth().revokeRefreshTokens(uid)
    const userRecord = await this.firebaseAdminService.getAuth().getUser(uid)
    return { revokedAt: new Date(userRecord.tokensValidAfterTime!).toISOString() }
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.log(`Generate password reset link for: ${email}`)
    await this.firebaseAdminService.getAuth().generatePasswordResetLink(email)
  }
}
