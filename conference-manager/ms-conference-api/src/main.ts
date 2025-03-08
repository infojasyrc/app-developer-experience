import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import express, { json, urlencoded } from 'express'

import router from './controllers/v1'
import serviceContainer from './services/service.container'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

const expressApp = express()
expressApp.use(json())
expressApp.use(urlencoded({ extended: false }))

const checkPublicUrls = (request: express.Request) => {
  return (
    request.path.includes('/v1/authenticate') ||
    request.path.includes('/v1/events') ||
    request.path.includes('/v1/token') ||
    request.path.includes('/v1/healthcheck') ||
    request.path.includes('/v1/open-api') ||
    request.path.includes('/v1/headquarters') ||
    request.path.includes('/v2') ||
    request.path.includes('/swagger')
  )
}

expressApp.use(async (request: any, response: any, next) => {
  if (checkPublicUrls(request)) {
    next()
    return
  }

  try {
    const token = request.headers['authorization']?.replace('Bearer ', '')

    const authService: any = await serviceContainer('authentication')
    const authVerifyResponse = await authService?.verifyToken(token)

    if (!authVerifyResponse.status) {
      return response.status(401).json({ status: '401', message: 'Unauthorized', data: {} })
    }

    request.user = { id: authVerifyResponse.data.id }
  } catch (error) {
    console.log(error)
    return response
      .status(500)
      .json({ status: '500', message: 'Error occurred during token verification', data: {} })
  }
  next()
})
expressApp.use('/v1', router)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  const configService = app.get(ConfigService)

  const swaggerTitle = configService.get<string>('SWAGGER_DOCS_TITLE', 'V2 API')
  const swaggerDescription = configService.get<string>(
    'SWAGGER_DOCS_DESCRIPTION',
    'API documentation'
  )
  const swaggerVersion = configService.get<string>('SWAGGER_DOCS_VERSION', '1.0')
  const swaggerPath = configService.get<string>('SWAGGER_DOCS_PATH', '/swagger')

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(swaggerPath, app, document)

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'],
  })
  await app.init()
  app.listen(Number(configService.get<string>('MS_PORT', '3000')))
}

bootstrap()
