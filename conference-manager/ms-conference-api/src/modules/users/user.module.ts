import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { User, UserSchema } from './user.entity'
import { UserService } from './user.service'
import { UserController } from '../../interfaces/user/user.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, Logger],
  exports: [MongooseModule],
})
export class UserModule {}
