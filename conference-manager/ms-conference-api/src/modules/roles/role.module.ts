import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Role, RoleSchema } from './role.entity'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],
  controllers: [RoleController],
  providers: [RoleService, Logger],
  exports: [MongooseModule],
})
export class RoleModule {}
