// test/app.controller.spec.ts
jest.setTimeout(15000);

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppModule } from '../../app.module';

const mockDecodedToken = { uid: 'test-user' };

jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn((token: string) => {
      if (token === 'valid-token') return Promise.resolve(mockDecodedToken);
      throw new Error('Invalid token');
    }),
  }),
  credential: {
    applicationDefault: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideModule(MongooseModule)
    .useModule({
      module: class FakeMongooseModule {},
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/ (GET) should return user profile with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect(mockDecodedToken);
  });

  it('/users/ (GET) should return 401 with invalid token', () => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
