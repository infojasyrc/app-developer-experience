import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

const GLOBAL_PREFIX = 'ms-nestjs-template/v1';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(GLOBAL_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ms-nestjs-template/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/health`)
      .expect(200)
      .expect('ok');
  });
});
