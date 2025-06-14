import { Controller, Get, HttpCode } from '@nestjs/common';

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
