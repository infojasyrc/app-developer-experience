import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'

import { FirebaseAuthStrategy } from './modules/firebase-auth/firebase-auth.strategy'
import getEnvironmentVariables from './infrastructure/environment'
import { ConferenceModule } from './modules/conferences/conference.module'
import { HeadquarterModule } from './modules/headquarter/headquarter.module'
import { UserModule } from './modules/users/user.module'
import { FirebaseModule } from './modules/firebase-auth/firebase.module'
import { AuthModule } from './modules/auth/auth.module'
import { RoleModule } from './modules/roles/role.module'
import { ProfileModule } from './modules/profile/profile.module'
import { UnleashProvider } from './infrastructure/unleash.provider'

import { HealthController } from './interfaces/health/health.controller'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          load: [getEnvironmentVariables],
          isGlobal: true,
        }),
        ConferenceModule,
        HeadquarterModule,
        UserModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        FirebaseModule,
        AuthModule,
        RoleModule,
        ProfileModule,
      ],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),],
  controllers: [HealthController],
  providers: [FirebaseAuthStrategy, UnleashProvider],
})
export class AppModule { }
