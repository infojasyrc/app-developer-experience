import { Logger, Module } from '@nestjs/common'

import { ProfileController } from './profile.controller'
import { UserModule } from '../users/user.module'

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [Logger],
})
export class ProfileModule {}
