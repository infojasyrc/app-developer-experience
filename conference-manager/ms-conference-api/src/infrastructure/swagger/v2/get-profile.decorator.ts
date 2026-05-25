import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'

import { User } from '../../../modules/users/user.entity'

export function GetProfileSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Authenticated user profile returned.', type: User }),
    ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required.' }),
    ApiResponse({ status: 404, description: 'User record not found.' }),
    ApiBearerAuth(),
  )
}
