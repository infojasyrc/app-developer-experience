import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('/v2/')
export class HealthController {
  constructor() {}

  @Get('healthcheck')
  @HttpCode(200)
  async check() {
    return {
      message: 'Health service nestjs modules',
    };
  }
}
