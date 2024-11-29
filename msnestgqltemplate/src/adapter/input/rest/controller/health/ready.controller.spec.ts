import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { HealthCheckExecutor } from '@nestjs/terminus/dist/health-check/health-check-executor.service';

import { EnvironmentVariables } from './../../../../../infrastructure/environment-variables';

import { ReadyController } from './ready.controller';

const healthCheckExecutorMock: Partial<HealthCheckExecutor> = {
  execute: jest.fn(),
};

const httpHealthIndicatorMock: Partial<HttpHealthIndicator> = {
  pingCheck: jest.fn(),
};

const configServiceMock: Partial<ConfigService<EnvironmentVariables>> = {
  get: jest.fn().mockReturnValue('TEST'),
};

describe('ReadyController', () => {
  let controller: ReadyController;
  let healthCheckService: HealthCheckService;
  let httpHealtIndicator: HttpHealthIndicator;
  let healthCheckExecutor: HealthCheckExecutor;
  let config: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadyController],
      providers: [
        HealthCheckService,
        {
          provide: HealthCheckExecutor,
          useValue: healthCheckExecutorMock,
        },
        {
          provide: HttpHealthIndicator,
          useValue: httpHealthIndicatorMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    healthCheckExecutor = module.get<HealthCheckExecutor>(HealthCheckExecutor);
    httpHealtIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    config = module.get<ConfigService<EnvironmentVariables>>(ConfigService);

    controller = new ReadyController(
      healthCheckService,
      httpHealtIndicator,
      config,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status ok', async () => {
    const successResult = {
      status: 'ok',
      info: {
        'healthcheck-datocms': {
          status: 'up',
        },
      },
      error: {},
      details: {
        'healthcheck-datocms': {
          status: 'up',
        },
      },
    };
    (healthCheckExecutor.execute as jest.Mock).mockReturnValue(successResult);
    const result = await controller.check();
    expect(result).toMatchObject({ status: 'ok' });
  });

  it('should return with status error', async () => {
    const errorResult = {
      status: 'error',
      info: {},
    };
    (healthCheckExecutor.execute as jest.Mock).mockReturnValue(errorResult);
    try {
      await controller.check();
    } catch (error) {
      expect((error as any).response).toMatchObject({ status: 'error' });
      expect((error as any).status).toBe(503);
    }
  });
});
