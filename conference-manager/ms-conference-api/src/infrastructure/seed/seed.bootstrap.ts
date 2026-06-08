import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { SeedModule } from './seed.module'
import { SeedService } from './seed.service'

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Seed must not run in production.')
    process.exit(1)
  }

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['log', 'warn', 'error'],
  })

  try {
    await app.get(SeedService).run()
  } finally {
    await app.close()
  }
}

bootstrap().catch(err => {
  Logger.error(err.message, err.stack, 'Seed')
  process.exit(1)
})
