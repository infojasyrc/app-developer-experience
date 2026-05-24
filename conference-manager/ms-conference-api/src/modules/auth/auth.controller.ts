import { Body, Controller, HttpCode, Logger, Post, Req, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE } from '../../common/constants'
import { RegisterSwaggerDecorator } from '../../infrastructure/swagger/v2/register.decorator'
import { RevokeTokenSwaggerDecorator } from '../../infrastructure/swagger/v2/revoke-token.decorator'
import { ResetPasswordSwaggerDecorator } from '../../infrastructure/swagger/v2/reset-password.decorator'

@ApiTags('auth')
@Controller('v2/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @Post('register')
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(201)
  @RegisterSwaggerDecorator()
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`POST /v2/auth/register`)
    return this.authService.register(dto)
  }

  @Post('revoke-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @RevokeTokenSwaggerDecorator()
  async revokeToken(@Req() req: Request) {
    const uid = (req.user as any).userId
    this.logger.log(`POST /v2/auth/revoke-token uid: ${uid}`)
    return this.authService.revokeToken(uid)
  }

  @Post('reset-password')
  @HttpCode(204)
  @ResetPasswordSwaggerDecorator()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    this.logger.log(`POST /v2/auth/reset-password`)
    await this.authService.resetPassword(dto.email)
  }
}
