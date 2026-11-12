import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'

import { ResetPasswordDto } from '../../../modules/auth/dto/reset-password.dto'

export function ResetPasswordSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 204, description: 'Password reset link generated and sent.' }),
    ApiResponse({ status: 400, description: 'Validation error or email not found.' }),
    ApiBody({ type: ResetPasswordDto })
  )
}
