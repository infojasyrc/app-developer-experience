import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'
import { initSwagger } from './infrastructure/swagger/swagger.config'
import { getCORSHeaders } from './infrastructure/headers'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const configService = app.get(ConfigService)

  const swaggerTitle = configService.get<string>('SWAGGER_DOCS_TITLE', 'V2 API')
  const swaggerDescription = configService.get<string>(
    'SWAGGER_DOCS_DESCRIPTION',
    'API documentation'
  )
  const swaggerVersion = configService.get<string>('SWAGGER_DOCS_VERSION', '1.0')
  const swaggerPath = configService.get<string>('SWAGGER_DOCS_PATH', '/docs')

  initSwagger(app, { title: swaggerTitle, description: swaggerDescription, version: swaggerVersion }, swaggerPath)

  app.enableCors(getCORSHeaders())
  await app.init()
  app.listen(Number(configService.get<string>('MS_PORT', '3000')))
}

bootstrap()
