// health.controller.spec.ts
jest.setTimeout(15000);

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TestAppModule } from '../../../tests/test-app.module'; // ✅ Not AppModule

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v2/healthcheck (GET) should return OK', () => {
    return request(app.getHttpServer())
      .get('/v2/healthcheck')
      .expect(200)
      .expect({"message":"Health service nestjs modules"});
  });
});
