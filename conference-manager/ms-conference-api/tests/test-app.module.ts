// test/test-app.module.ts
import { Module, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

import { User } from '../src/modules/users/user.entity';
import { UserService } from '../src/modules/users/user.service';
import { HealthController } from '../src/interfaces/health/health.controller';
import { UserController } from '../src/interfaces/user/user.controller';
import { FirebaseAuthProvider } from '../src/infrastructure/firebase-auth.provider';

@Module({
  controllers: [HealthController, UserController],
  providers: [
    FirebaseAuthProvider,
    UserService,
    {
      provide: getModelToken(User.name),
      useValue: {
        find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        findOne: jest.fn().mockResolvedValue(null),
        findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
        findOneAndDelete: jest.fn(),
        create: jest.fn(),
      },
    },
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
