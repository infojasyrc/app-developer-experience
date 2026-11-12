import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

interface SwaggerConfigProps {
  title: string
  description: string
  version: string
}

const getSwaggerConfig = ({
  title,
  description,
  version,
}: SwaggerConfigProps) => {
  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth()
    .build()
}

const initSwagger = (app: any, configParams: SwaggerConfigProps, swaggerPath: string = '/docs') => {
  const config = getSwaggerConfig({
    title: configParams.title || 'V2 API',
    description: configParams.description || 'API documentation',
    version: configParams.version || '1.0'
  })
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(swaggerPath, app, document)
}

export { initSwagger }
