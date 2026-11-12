import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { User, UserSchema } from '../../modules/users/user.entity'
import { Headquarter, HeadquarterSchema } from '../../modules/headquarter/headquarter.entity'
import { Conference, ConferenceSchema } from '../../modules/conferences/conference.entity'
import { ClearService } from './clear.service'
import getEnvironmentVariables from '../environment'

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
    MongooseModule.forFeature([
      { name: User.name,        schema: UserSchema        },
      { name: Headquarter.name, schema: HeadquarterSchema },
      { name: Conference.name,  schema: ConferenceSchema  },
    ]),
  ],
  providers: [Logger, ClearService],
})
export class ClearModule {}
