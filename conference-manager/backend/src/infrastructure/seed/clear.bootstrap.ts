import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'

import { ClearModule } from './clear.module'
import { ClearService } from './clear.service'

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Clear script must not run in production.')
    process.exit(1)
  }

  const app = await NestFactory.createApplicationContext(ClearModule, {
    logger: ['log', 'warn', 'error'],
  })

  try {
    await app.get(ClearService).run()
  } finally {
    await app.close()
  }
}

bootstrap().catch(err => {
  Logger.error(err.message, err.stack, 'Clear')
  process.exit(1)
})
