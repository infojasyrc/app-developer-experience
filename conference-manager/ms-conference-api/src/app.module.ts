import { ConfigModule, ConfigService } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'

import { FirebaseAuthStrategy } from './modules/firebase-auth/firebase-auth.strategy'
import getEnvironmentVariables from './infrastructure/environment'
import { ConferenceModule } from './modules/conferences/conference.module'
// import { HeadquarterModule } from './modules/headquarter/headquarter.module'
// import { UserModule } from './modules/users/user.module'
import { FirebaseModule } from './modules/firebase-auth/firebase.module'
import { UnleashProvider } from './infrastructure/unleash.provider'

import { GetUsersUseCase } from './application/use-cases/user/get-users.usecase'
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
        // UserModule,
        // EventModule,
        // HeadquarterModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        FirebaseModule,
      ],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),],
  controllers: [HealthController],
  providers: [FirebaseAuthStrategy, GetUsersUseCase, UnleashProvider],
})
export class AppModule {}
