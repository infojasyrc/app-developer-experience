import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

import { EnvironmentVariables } from './../../../../../infrastructure/environment-variables';

@Controller('ready')
export class ReadyController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly config: ConfigService<EnvironmentVariables>,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.http.pingCheck(
          'healthcheck-integration',
          this.config.get('INTEGRATION_ENVIRONMENT_URL_LIVENESS'),
          {
            headers: {
              Authorization: `Bearer ${this.config.get(
                'INTEGRATION_API_TOKEN',
              )}`,
            },
          },
        ),
    ]);
  }
}
