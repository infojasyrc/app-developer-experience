import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Conference, ConferenceSchema } from './conference.entity'
import { ConferenceController } from './conference.controller'
import { ConferenceService } from './conference.service'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conference.name, schema: ConferenceSchema }]),
    FirebaseModule,
  ],
  controllers: [ConferenceController],
  providers: [
    ConferenceService,
    Logger,
    FirebaseAdminService,
    FirebaseUploadService,
    ImageUploadInterceptor,
  ],
  exports: [MongooseModule],
})
export class ConferenceModule {}
