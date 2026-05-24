import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { User } from '../../../modules/users/user.entity'

export function UpdateUserSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'User successfully updated', type: User }),
    ApiResponse({ status: 400, description: 'Bad request, some fields did not pass validation.' }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth()
  )
}
