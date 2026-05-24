import { Logger, Module } from '@nestjs/common'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { UserModule } from '../users/user.module'

@Module({
  imports: [FirebaseModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService, Logger],
})
export class AuthModule {}
