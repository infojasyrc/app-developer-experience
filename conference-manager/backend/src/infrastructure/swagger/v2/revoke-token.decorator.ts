import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

export function RevokeTokenSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Refresh tokens revoked. Returns the revocation timestamp.' }),
    ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' }),
    ApiBearerAuth()
  )
}
