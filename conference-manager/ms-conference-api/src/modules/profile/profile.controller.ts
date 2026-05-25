import { Controller, Get, HttpCode, Logger, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

import { UserService } from '../users/user.service'
import { UserResponse } from '../users/interfaces/user-response'
import { GetProfileSwaggerDecorator } from '../../infrastructure/swagger/v2/get-profile.decorator'

@ApiTags('profile')
@Controller('v2/profile')
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @GetProfileSwaggerDecorator()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async getProfile(@Req() req: Request): Promise<UserResponse> {
    const uid = (req.user as any).userId
    this.logger.log(`GET /v2/profile uid: ${uid}`)
    return this.userService.getByUid(uid)
  }
}
