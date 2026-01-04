import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Conference, ConferenceSchema } from './conference.entity'
import { ConferenceController } from './conference.controller'
import { ConferenceService } from './conference.service'

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: Conference.name,
      schema: ConferenceSchema,
    }])
  ],
  controllers: [ConferenceController],
  providers: [ConferenceService, Logger],
  exports: [MongooseModule],
})
export class ConferenceModule {}
