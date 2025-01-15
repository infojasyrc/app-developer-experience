import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { EventSchema, Event } from './event.entity'
import { EventController } from './event.controller'
import { EventService } from './event.service'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { EventTransformInterceptor } from './interceptors/event.interceptor'
import { UserModule } from '../users/user.module'
import { FirebaseModule } from '../firebase-auth/firebase.module'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'
import { FirebaseAdminService } from '../firebase-auth/firebase-admin.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    UserModule, 
    FirebaseModule,
  ],
  controllers: [EventController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: EventTransformInterceptor},
    EventService, 
    Logger, 
    FirebaseAdminService, 
    FirebaseUploadService
  ],
  exports: [MongooseModule],
})
export class EventModule {}
