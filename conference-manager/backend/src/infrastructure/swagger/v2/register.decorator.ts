import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger'

import { RegisterDto } from '../../../modules/auth/dto/register.dto'

export function RegisterSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 201, description: 'Firebase auth user and MongoDB user record created.' }),
    ApiResponse({ status: 400, description: 'Validation error or email already in use.' }),
    ApiBody({ type: RegisterDto }),
    ApiBearerAuth()
  )
}
