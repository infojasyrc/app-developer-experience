import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './adapter/input/rest/controller/health/health.controller';
import { ReadyController } from './adapter/input/rest/controller/health/ready.controller';

@Module({
  imports: [ConfigModule.forRoot(), TerminusModule],
  controllers: [HealthController, ReadyController],
  providers: [],
})
export class AppModule {}
