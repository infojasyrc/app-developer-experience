import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { User } from '../../../modules/users/user.entity'

export function ListUsersSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 200, description: 'Users successfully listed', type: [User] }),
    ApiBearerAuth()
  )
}
