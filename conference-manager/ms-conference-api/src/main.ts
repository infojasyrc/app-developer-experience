import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'
import { MetricsInterceptor } from './infrastructure/monitoring/metrics.interceptor'
import { MetricsService } from './infrastructure/monitoring/metrics.service'
import { initSwagger } from './infrastructure/swagger/swagger.config'
import { getCORSHeaders } from './infrastructure/headers'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  app.enableCors(getCORSHeaders())

  const metricsService = app.get(MetricsService)
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const swaggerTitle = configService.get<string>('SWAGGER_DOCS_TITLE', 'V2 API')
  const swaggerDescription = configService.get<string>(
    'SWAGGER_DOCS_DESCRIPTION',
    'API documentation'
  )
  const swaggerVersion = configService.get<string>('SWAGGER_DOCS_VERSION', '1.0')
  const swaggerPath = configService.get<string>('SWAGGER_DOCS_PATH', '/docs')

  initSwagger(app, { title: swaggerTitle, description: swaggerDescription, version: swaggerVersion }, swaggerPath)

  await app.init()
  const port = Number(configService.get<string>('MS_PORT', '5002'));
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Metrics available on: http://localhost:${port}/metrics`);
}

bootstrap()
