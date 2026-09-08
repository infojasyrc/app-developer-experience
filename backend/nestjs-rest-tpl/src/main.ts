import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './infrastructure/environment-variables';

async function bootstrap() {
  const GLOBAL_PREFIX = 'ms-nestjs-template/v1';
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(GLOBAL_PREFIX);
  const config = new ConfigService<EnvironmentVariables>();
  await app.listen(config.get<number>('HTTP_PORT', 4000), '0.0.0.0');
}
bootstrap();
