// test/app.controller.spec.ts
jest.setTimeout(15000);

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestAppModule } from '../../../tests/test-app.module'; // ✅ Not AppModule

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
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/ (GET) should return user profile with valid token', () => {
    return request(app.getHttpServer())
      .get('/v2/users/')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect([]);
  });

  it('/users/ (GET) should return 401 with invalid token', () => {
    return request(app.getHttpServer())
      .get('/v2/users/')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
