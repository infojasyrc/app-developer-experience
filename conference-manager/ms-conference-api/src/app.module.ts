import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'

import { FirebaseAuthStrategy } from './modules/firebase-auth/firebase-auth.strategy'
import { HealthController } from './modules/health-service/health.controller'
import getEnvironmentVariables from './infrastructure/environment'
import { EventModule } from './modules/events/event.module'
import { HeadquarterModule } from './modules/headquarter/headquarter.module'
import { UserModule } from './modules/users/user.module'
import { FirebaseModule } from './modules/firebase-auth/firebase.module'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          load: [getEnvironmentVariables],
          isGlobal: true,
        }),
        UserModule,
        EventModule,
        HeadquarterModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        FirebaseModule,
      ],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController],
  providers: [FirebaseAuthStrategy],
})
export class AppModule {}
