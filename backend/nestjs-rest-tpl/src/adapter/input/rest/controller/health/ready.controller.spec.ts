import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { HttpHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentVariables } from './../../../../../infrastructure/environment-variables.js';

import { ReadyController } from './ready.controller.js';

const httpHealthIndicatorMock: Partial<HttpHealthIndicator> = {
  pingCheck: vi.fn(),
};

const configServiceMock: Partial<ConfigService<EnvironmentVariables>> = {
  get: vi.fn().mockReturnValue('TEST'),
};

describe('ReadyController', () => {
  let controller: ReadyController;
  let httpHealthIndicator: HttpHealthIndicator;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [ReadyController],
      providers: [
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    })
      .overrideProvider(HttpHealthIndicator)
      .useValue(httpHealthIndicatorMock)
      .compile();

    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    controller = module.get<ReadyController>(ReadyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status ok', async () => {
    (httpHealthIndicator.pingCheck as Mock).mockResolvedValue({
      'healthcheck-integration': { status: 'up' },
    });

    const result = await controller.check();

    expect(httpHealthIndicator.pingCheck).toHaveBeenCalledWith(
      'healthcheck-integration',
      'TEST',
      {
        headers: {
          Authorization: 'Bearer TEST',
        },
      },
    );
    expect(result).toMatchObject({ status: 'ok' });
  });

  it('should return with status error', async () => {
    (httpHealthIndicator.pingCheck as Mock).mockResolvedValue({
      'healthcheck-integration': { status: 'down' },
    });

    await expect(controller.check()).rejects.toMatchObject({
      response: { status: 'error' },
      status: 503,
    });
  });
});
