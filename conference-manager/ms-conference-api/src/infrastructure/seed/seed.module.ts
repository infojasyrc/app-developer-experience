import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { User, UserSchema } from '../../modules/users/user.entity'
import { Headquarter, HeadquarterSchema } from '../../modules/headquarter/headquarter.entity'
import { Conference, ConferenceSchema } from '../../modules/conferences/conference.entity'
import { UserService } from '../../modules/users/user.service'
import { HeadquarterService } from '../../modules/headquarter/headquarter.service'
import { ConferenceService } from '../../modules/conferences/conference.service'
import { FirebaseUploadService } from '../../modules/firebase-auth/firebase-upload-file.service'
import { SeedService } from './seed.service'
import getEnvironmentVariables from '../environment'

// Noop upload service — seeding never uploads images
const noopFirebaseUploadService = {
  uploadFile: async () => '',
  deleteFile: async () => {},
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [getEnvironmentVariables],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (cfg: ConfigService) => ({ uri: cfg.get('MONGODB_URI') }),
      inject: [ConfigService],
    }),
    // Register all required schemas directly — avoids importing ConferenceModule /
    // HeadquarterModule which transitively pull in FirebaseModule and trigger
    // FirebaseAdminService.onModuleInit()
    MongooseModule.forFeature([
      { name: User.name,        schema: UserSchema        },
      { name: Headquarter.name, schema: HeadquarterSchema },
      { name: Conference.name,  schema: ConferenceSchema  },
    ]),
  ],
  providers: [
    Logger,
    SeedService,
    UserService,
    HeadquarterService,
    ConferenceService,
    { provide: FirebaseUploadService, useValue: noopFirebaseUploadService },
  ],
})
export class SeedModule {}
