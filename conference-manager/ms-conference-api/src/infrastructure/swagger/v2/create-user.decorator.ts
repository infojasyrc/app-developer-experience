import { applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { User } from '../../../modules/users/user.entity'

export function CreateUserSwaggerDecorator() {
  return applyDecorators(
    ApiResponse({ status: 201, description: 'User successfully created', type: User }),
    ApiResponse({ status: 400, description: 'Bad request or uid/email already exists.' }),
    ApiBearerAuth()
  )
}
