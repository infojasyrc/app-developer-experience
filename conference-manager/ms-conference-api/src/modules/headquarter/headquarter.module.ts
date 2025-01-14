import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Headquarter, HeadquarterSchema } from './headquarter.entity'
import { HeadquarterController } from './headquarter.controller'
import { HeadquarterService } from './headquarter.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Headquarter.name, schema: HeadquarterSchema }])],
  controllers: [HeadquarterController],
  providers: [HeadquarterService, Logger],
  exports: [MongooseModule],
})
export class HeadquarterModule {}
