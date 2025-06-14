// test/test-app.module.ts
import { Module, Logger } from '@nestjs/common';
// Add use cases
import { GetUsersUseCase } from '../src/application/use-cases/user/get-users.usecase'
// Add controllers
import { HealthController } from '../src/interfaces/health/health.controller';
import { UserController } from '../src/interfaces/user/user.controller';
// Add only what you need
import { FirebaseAuthProvider } from '../src/infrastructure/firebase-auth.provider';

@Module({
  controllers: [HealthController, UserController],
  providers: [
    FirebaseAuthProvider,
    GetUsersUseCase,
    {
      provide: Logger,
      useValue: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      },
    },
  ],
})
export class TestAppModule {}
