import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { User } from '../../../modules/users/user.entity'

export function GetUserByUidSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'User found', type: User }),
    ApiResponse({ status: 404, description: 'User not found.' }),
    ApiBearerAuth()
  )
}
