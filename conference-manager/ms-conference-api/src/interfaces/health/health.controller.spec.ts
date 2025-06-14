// health.controller.spec.ts
jest.setTimeout(15000);

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppModule } from '../../app.module';

describe('HealthController (e2e)', () => {
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

  it('/health (GET) should return OK', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('OK');
  });
});
